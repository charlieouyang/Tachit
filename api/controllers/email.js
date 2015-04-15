module.exports = function (router) {
    'use strict';

    var db = require('../models'),
        validator = require('validator'),
        Email = db.Email,
        availableFields = {
            'email_address': 'email_address',
            'created_at': 'created_at'
        };

    router.get('/email', function(req, res) {
        Email.findAll().then(function(emails) {
            var dict = {};

            if (emails.length < 1) {
                dict.message ='No emails found';
                res.statusCode = 200;
                res.json(dict);
            } else {
                dict.result = emails;
                dict.message ="Emails found!";
                dict.emails_found = emails.length;
                res.statusCode = 200;
                res.json(dict);
            }
        }).catch(function(error) {
            res.statusCode = 422;
            var dict = {
                    message: 'Emails not found',
                    errors: []
                };

            dict.errors.push(error);
            res.json(dict);
        });
    });

    router.post('/email', function(req, res) {
        var data = req.body,
            acceptedField = {
                'email_address': 'email_address'
            },
            valid = {};

        for (var key in acceptedField) {
            if (acceptedField.hasOwnProperty(key)) {
                var dataKey = acceptedField[key];
                valid[key] = data[dataKey];
            }
        }

        if (!valid.email_address || valid.email_address === "" || !validator.isEmail(valid.email_address)) {
            var dict = {};
            res.statusCode = 400;
            dict.reason = 'invalid';
            dict.message = 'email_address is invalid';
            res.json(dict);
            return;
        }

        Email.findAll({
            where: {email_address: valid["email_address"]}
        }).then(function(emails) {
            var dict = {};

            if (emails.length < 1) {
                Email.create(valid).then(function(email) {
                    var dict = {};

                    for (var key in availableFields) {
                        if (availableFields.hasOwnProperty(key)) {
                            dict[availableFields[key]] = email[key];
                        }
                    }

                    dict.message = "Email recorded!";
                    res.statusCode = 201;
                    res.json(dict);

                }).catch(function(error) {
                    res.statusCode = 422;
                    var dict = {
                            message: 'Email registration failed',
                            errors: []
                        };

                    dict.errors.push(error);
                    res.json(dict);
                });
            } else {
                var dict = {};

                dict.message = "Email already recorded!";
                res.statusCode = 201;
                res.json(dict);
            }
        }).catch(function(error) {
            var dict = {};
            res.statusCode = 500;

            dict.message = 'Finding emails failed';
            dict.error = error;
            res.json(dict);
        });
    });
};