module.exports = function (router) {
    'use strict';

//------------------ Endpoint lists ------------------
// 1) Link get - GET (check to see if URL is used or not)
// 2) Link create - POST (create a link and store this in DB)
//----------------------------------------------------

    var db = require('../models'),
        crypto = require('crypto'),
        AWS = require('aws-sdk'),
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
        s3Config = require('../config/config.json')["default"].s3;

    router.get('/link', function(req, res) {
        var dict = {};

        dict.message ='Welcome to the Links API!!';
        dict.endpoints = '------------------ Endpoint lists ------------------ \n \
                            1) Link get - GET (check to see if URL is used or not /link/{link_url}) \n \
                            2) Link create - POST (create a link and store this in DB /link) \n \
                               Available Fields for POST \n \
                                  "link_url": "" \n \
                                  "name": "" \n \
                                  "description": "" \n \
                                  "media_type": "" \n \
                                  "user_name": "" \n \
                         ----------------------------------------------------';

        res.statusCode = 200;
        res.json(dict);
    });

    router.get('/link/test', function(req, res) {
        var dict = {};

        dict.message ='Welcome to the Links API!! Sanity testing for Charlie';

        res.statusCode = 200;
        res.json(dict);
    });

    router.get('/link/:link_url', function(req, res) {
        Link.findAll({
            where: {link_url: req.params.link_url}
        }).then(function(links) {
            var dict = {};

            if (links.length < 1) {
                dict.message ='No links found';
                dict.links_found = links.length;
                res.statusCode = 200;
            } else if (links.length === 1) {
                dict.result = links;
                dict.message ='Found 1 link';
                dict.links_found = links.length;
                res.statusCode = 200;
            } else {
                dict.result = links;
                dict.message ="Multiple links found... This shouldn't happen";
                dict.links_found = links.length;
                res.statusCode = 409;
            }
            res.json(dict);
        });
    });

    router.post('/link', function(req, res) {
        var data = req.body,
            acceptedField = {
                'link_url': 'link_url',
                'name': 'name',
                'description': 'description',
                'media_type': 'media_type',
                'user_name': 'user_name'
            },
            valid = {},
            s3Instance,
            params,
            presignedUrl;

        for (var key in acceptedField) {
            if (acceptedField.hasOwnProperty(key)) {
                var dataKey = acceptedField[key];
                valid[key] = data[dataKey];
            }
        }

        Link.findAll({
            where: {link_url: data.link_url}
        }).then(function(links) {
            var dict = {},
                date = new Date(),
                mediaTypes = s3Config.media_types,
                fileName;

            fileName = valid.user_name + "/" + date.getTime() + "-" + valid.user_name;

            if (valid.media_type === "video") { 
                fileName += mediaTypes.video;
            } else if (valid.media_type === "picture") {
                fileName += mediaTypes.picture;
            } else if (valid.media_type === "voice") {
                fileName += mediaTypes.voice;
            } else if (valid.media_type === "text") {
                fileName += mediaTypes.text;
            }

            valid.amazon_key = fileName;

            if (links.length === 0) {
                Link.create(valid).then(function(link) {
                    var dict = {},
                        generatedPolicy;

                    for (var key in availableFields) {
                        if (availableFields.hasOwnProperty(key)) {
                            dict[availableFields[key]] = link[key];
                        }
                    }

                    AWS.config = {
                        "accessKeyId": s3Config.accessKeyId, 
                        "secretAccessKey": s3Config.secret, 
                        "region": s3Config.region
                    };

                    s3Instance = new AWS.S3();
                    params = {Bucket: s3Config.bucket, Key: fileName};
                    s3Instance.getSignedUrl('putObject', params, function (err, url) {
                        dict.presignedUploadURL = url;
                        res.statusCode = 201;
                        res.json(dict);
                    });

                    /*
                    Sample upload curl call
                    curl --upload-file file.txt "https://s3.amazonaws.com/www.linkprototype.com/charlieouyang/1426197530645-charlieouyang.txt?AWSAccessKeyId=AKIAJZUXHNLLC3H7H4AA&Expires=1426198430&Signature=aKX1AJ0f7SSUKgVfxhaxJ0lmPPs%3D"
                    */
                    
                    /*
                    console.log("trying again");
                    var s3 = new AWS.S3();
                    var params = {Bucket: s3Config.bucket, Key: 'helloWorld.txt'};
                    s3.getSignedUrl('getObject', params, function (err, url) {
                        dict.presignedGetURL = url;
                        res.statusCode = 201;
                        res.json(dict);
                    });

                    console.log("Finishing up with S3");
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