module.exports = function (router) {
    'use strict';

//------------------ Endpoint lists ------------------
// 1) Link get - GET (check to see if URL is used or not)
// 2) Link create - POST (create a link and store this in DB)
//----------------------------------------------------

    var db = require('../models'),
        crypto = require('crypto'),
        AWS = require('aws-sdk'),
        async = require('async'),
        fs = require('fs'),
        Link = db.Link,
        availableFields = {
            'link_url': 'link_url',
            'amazon_url': 'amazon_url',
            'name': 'name',
            'description': 'description',
            'media_type': 'media_type',
            'created_at': 'created_at',
            'user_id': 'user_id'
        },
        s3Config = require('../config/config.json')["default"].s3,
        mediaTypes = require('../config/config.json')["default"].media_types;

    AWS.config = {
        "accessKeyId": s3Config.accessKeyId, 
        "secretAccessKey": s3Config.secret, 
        "region": s3Config.region
    };

    router.get('/link', function(req, res) {
        var dict = {};

        dict.message ='Welcome to the Links API!! Only ballers come here!';

        res.statusCode = 200;
        res.json(dict);
    });

    router.get('/link/:link_url', function(req, res) {
        Link.findAll({
            where: {link_url: req.params.link_url}
        }).then(function(links) {
            var dict = {},
                calls = [],
                s3Instance,
                params;

            if (links.length < 1) {
                dict.message ='No links found';
                dict.links_found = links.length;
                res.statusCode = 200;
                res.json(dict);
            } else {
                s3Instance = new AWS.S3();

                links.forEach(function(link) {
                    calls.push(function(callback) {
                        params = {Bucket: s3Config.bucket, Key: link.dataValues.amazon_key};
                        s3Instance.getSignedUrl('getObject', params, function (err, url) {
                            if (err) {
                                return callback(err);
                            }
                            callback(null, {
                                "presignedGetURL": url,
                                "name": link.dataValues.name,
                                "description": link.dataValues.description,
                                "media_type": link.dataValues.media_type,
                                "user_name": link.dataValues.user_name
                            });
                        });
                    });
                });

                async.parallel(calls, function(err, result) {
                    if (err) {
                        res.statusCode = 500;
                        res.json(err);
                    }
                    res.statusCode = 201;
                    res.json({
                        "message": "Links found!",
                        "links_found": result.length,
                        "link_url": req.params.link_url,
                        "result": result
                    });
                });
            }
        }).catch(function(error) {
            var dict = {};
            res.statusCode = 500;

            dict.message = 'Get Links failed';
            dict.error = error;
            res.json(dict);
        });
    });

    router.post('/link', function(req, res) {
        var data = req.body,
            dataLength = data.data.length,
            acceptedField = {
                'name': 'name',
                'description': 'description',
                'media_type': 'media_type',
                'user_name': 'user_name'
            },
            validResults = [],
            valid = {},
            s3Instance,
            params,
            presignedUrl;

        for (var index = 0; index < dataLength; index++) {
            for (var key in acceptedField) {
                if (acceptedField.hasOwnProperty(key)) {
                    var dataKey = acceptedField[key];
                    valid[key] = data.data[index][dataKey];
                }
            }
            valid.link_url = data.link_url;
            validResults.push(valid);
            valid = {};
        }

        Link.findAll({
            where: {link_url: data.link_url}
        }).then(function(links) {
            var dict = {},
                date = new Date(),
                fileName,
                dataObj,
                concatenatedFileName;

            for (var index = 0; index < validResults.length; index++) {
                dataObj = validResults[index];
                concatenatedFileName = dataObj.name + dataObj.description + dataObj.media_type;
                fileName = dataObj.user_name + "/" + crypto.createHash('md5').update(concatenatedFileName).digest('hex');

                console.log("input type: " + dataObj.media_type);
                console.log("s3Config %j", s3Config);
                console.log("config media %j", mediaTypes);
                if (dataObj.media_type === "video") { 
                    fileName += mediaTypes.video;
                } else if (dataObj.media_type === "picture") {
                    fileName += mediaTypes.picture;
                } else if (dataObj.media_type === "voice") {
                    fileName += mediaTypes.voice;
                } else if (dataObj.media_type === "text") {
                    fileName += mediaTypes.text;
                }

                dataObj.amazon_key = fileName;
            }

            if (links.length === 0) {
                Link.bulkCreate(validResults).then(function(links) {
                    var dict = {},
                        generatedPolicy,
                        calls = [];

                    s3Instance = new AWS.S3();

                    links.forEach(function(link){
                        calls.push(function(callback) {
                            params = {Bucket: s3Config.bucket, Key: link.dataValues.amazon_key};
                            s3Instance.getSignedUrl('putObject', params, function (err, url) {
                                if (err) {
                                    return callback(err);
                                }
                                console.log('generated URL');
                                callback(null, {
                                    "presignedUploadURL": url,
                                    "name": link.dataValues.name,
                                    "description": link.dataValues.description,
                                    "media_type": link.dataValues.media_type,
                                    "user_name": link.dataValues.user_name
                                });
                            });
                        });
                    });

                    async.parallel(calls, function(err, result) {
                        if (err) {
                            res.statusCode = 500;
                            res.json(err);
                        }
                        res.statusCode = 201;
                        res.json({
                            "link_url": data.link_url,
                            "result": result
                        });
                    });

                    /*
                    Sample upload curl call
                    curl --upload-file file.txt "https://s3.amazonaws.com/www.linkprototype.com/charlieouyang/1426197530645-charlieouyang.txt?AWSAccessKeyId=AKIAJZUXHNLLC3H7H4AA&Expires=1426198430&Signature=aKX1AJ0f7SSUKgVfxhaxJ0lmPPs%3D"
                    */

                }).catch(function(error) {
                    res.statusCode = 422;
                    var dict = {message: 'Validation Failed', errors: []},
                        errors = error.errors[0];

                    dict.errors.push(errors);
                    res.json(dict);
                });
            } else {
                dict.result = links;
                dict.message ="Link already exists";
                dict.links_found = links.length;
                res.statusCode = 409;
                res.json(dict);
            }
        });
    });
};