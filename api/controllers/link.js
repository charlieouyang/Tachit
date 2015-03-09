module.exports = function (router) {
    'use strict';

//------------------ Endpoint lists ------------------
// 1) Link get - GET (check to see if URL is used or not)
// 2) Link create - POST (create a link and store this in DB)
//----------------------------------------------------

    var db = require('../models'),
        crypto = require('crypto'),
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
        generatePolicy = function(mediaType) {
            var policyUnfinished = s3Config.uploadPolicy,
                currentDate = new Date(),
                expirationDate,
                contentTypeArr;

            currentDate.setFullYear(currentDate.getFullYear() + 5);
            expirationDate = currentDate.toISOString();
            policyUnfinished.expiration = expirationDate;

            contentTypeArr = ["starts-with", "$Content-Type", mediaType];
            policyUnfinished.conditions.push(contentTypeArr);

            return policyUnfinished;
        },
        generateSignature = function(policy) {
            var encodedPolicy = new Buffer(JSON.stringify(policy)).toString("base64"),
                secret = s3Config.secret;

            return crypto.createHmac('sha1', secret).update(encodedPolicy).digest('base64');
        };

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
                         ----------------------------------------------------';

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
                'media_type': 'media_type'
            },
            valid = {};

        for (var key in acceptedField) {
            if (acceptedField.hasOwnProperty(key)) {
                var dataKey = acceptedField[key];
                valid[key] = data[dataKey];
            }
        }

        Link.findAll({
            where: {link_url: data.link_url}
        }).then(function(links) {
            var dict = {};

            if (links.length === 0) {
                Link.create(valid).then(function(link) {
                    var dict = {},
                        generatedPolicy;

                    for (var key in availableFields) {
                        if (availableFields.hasOwnProperty(key)) {
                            dict[availableFields[key]] = link[key];
                        }
                    }

                    generatedPolicy = generatePolicy(link.media_type);
                    dict.policy = generatedPolicy;
                    dict.upload_signature = generateSignature(generatedPolicy);
                    dict.accessKeyId = s3Config.accessKeyId;

                    res.statusCode = 201;
                    res.json(dict);
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