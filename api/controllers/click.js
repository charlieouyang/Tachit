module.exports = function (router) {
    'use strict';

//------------------ Endpoint lists ------------------
// 1) Link get - GET (check to see if URL is used or not)
// 2) Link create - POST (create a link and store this in DB)
//----------------------------------------------------

    var db = require('../models'),
        Click = db.Click,
        availableFields = {
            'click_placement': 'click_placement',
            'country': 'country',
            'region': 'region',
            'city': 'city',
            'zip_code': 'zip_code',
            'created_at': 'created_at'
        };

    router.get('/click', function(req, res) {
        var dict = {};

        dict.message ='Welcome to the click API';

        res.statusCode = 200;
        res.json(dict);
    });

    router.get('/click/:click_placement', function(req, res) {
        Click.findAll({
            where: {click_placement: req.params.click_placement}
        }).then(function(clicks) {
            var dict = {},
                params,
                linkResult;

            if (clicks.length < 1) {
                dict.message ='No clicks found';
                dict.links_found = links.length;
                res.statusCode = 200;
                res.json(dict);
            } else {
                dict.result = clicks;
                dict.message ="Clicks found!";
                dict.clicks_found = clicks.length;
                res.statusCode = 200;
                res.json(dict);
            }
        }).catch(function(error) {
            res.statusCode = 422;
            var dict = {
                    message: 'placement not found',
                    errors: []
                };

            dict.errors.push(error);
            res.json(dict);
        });
    });

    router.post('/click', function(req, res) {
        var data = req.body,
            acceptedField = {
                'click_placement': 'click_placement',
                'country': 'country',
                'region': 'region',
                'city': 'city',
                'zip_code': 'zip_code'
            },
            valid = {};

        for (var key in acceptedField) {
            if (acceptedField.hasOwnProperty(key)) {
                var dataKey = acceptedField[key];
                valid[key] = data[dataKey];
            }
        }

        Click.create(valid).then(function(click) {
            var dict = {};

            for (var key in availableFields) {
                if (availableFields.hasOwnProperty(key)) {
                    dict[availableFields[key]] = click[key];
                }
            }

            dict.message = "Click registered!";
            res.statusCode = 201;
            res.json(dict);

        }).catch(function(error) {
            res.statusCode = 422;
            var dict = {
                    message: 'Click registration failed',
                    errors: []
                };

            dict.errors.push(error);
            res.json(dict);
        });
    });
};