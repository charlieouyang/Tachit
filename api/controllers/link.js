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
                s3Instance,
                params,
                presignedUrl,
                linkResult;

            if (links.length < 1) {
                dict.message ='No links found';
                dict.links_found = links.length;
                res.statusCode = 200;
                res.json(dict);
            } else if (links.length === 1) {
                linkResult = links[0];
                dict.result = links;
                dict.message ='Found 1 link';
                dict.links_found = links.length;

                s3Instance = new AWS.S3();
                params = {Bucket: s3Config.bucket, Key: linkResult.amazon_key};
                s3Instance.getSignedUrl('getObject', params, function (err, url) {
                    dict.presignedGetURL = url;
                    res.statusCode = 200;
                    res.json(dict);
                });

                res.statusCode = 200;
            } else {
                dict.result = links;
                dict.message ="Multiple links found... This shouldn't happen";
                dict.links_found = links.length;
                res.statusCode = 200;
                res.json(dict);
            }
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
                fileName;

            fileName = valid.user_name + "/" + date.getTime() + "-" + valid.user_name;

            console.log("input type: " + valid.media_type);
            console.log("s3Config %j", s3Config);
            console.log("config media %j", mediaTypes);
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