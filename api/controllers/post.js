module.exports = function (router) {
    'use strict';

//------------------ Endpoint lists ------------------
// 1) Post get - GET (get all posts by userid)
// 2) Post create - POST (create a post by userid)
// 3) Post update - PUT (update/edit the post)
// 4) Post delete - DELETE (delete the post)
//----------------------------------------------------

    var db = require('../models'),
        auth = require('../middleware/authentication'),
        User = db.User,
        Post = db.Post,
        availableFields = {
            'id': 'id',
            'name': 'name',
            'content': 'content',
            'createdAt': 'createdAt',
            'updatedAt': 'updatedAt',
            'UserId': 'userId'
        };

    router.get('/posts', auth, function(req, res) {
        var userId = req.userId;

        Post.findAll({
            where: {userId: userId}
        }).then(function(posts) {
            var response = [];
            posts.forEach(function(post) {
                var dict = {};
                for (var key in availableFields) {
                    if (availableFields.hasOwnProperty(key)) {
                        dict[availableFields[key]] = post[key];
                    }
                }

                if (Object.keys(dict).length > 0) {
                    response.push(dict);
                }
            });
            res.json(response);
        });
    });

    router.post('/posts', auth, function(req, res) {
        var user = req.userInstance,
            data = req.body,
            acceptedField = {
                'name': 'name',
                'content': 'content'
            },
            valid = {};

        for (var key in acceptedField) {
            if (acceptedField.hasOwnProperty(key)) {
                var dataKey = acceptedField[key];
                valid[key] = data[dataKey];
            }
        }

        Post.create(valid).then(function(post) {
            var dict = {};

            post.setUser(user);
            for (var key in availableFields) {
                if (availableFields.hasOwnProperty(key)) {
                    dict[availableFields[key]] = post[key];
                }
            }

            console.log("%j", post)

            res.json(dict);
        }).catch(function(error) {
            return next();
        });
    });

    router.put('/posts/:postId', auth, function(req, res) {
        var data = req.body,
            userId = req.userId,
            acceptedField = {
                'name': 'name',
                'content': 'content'
            },
            valid = {};

        for (var key in acceptedField) {
            if (acceptedField.hasOwnProperty(key)) {
                var dataKey = acceptedField[key];
                if (data[dataKey]) {
                    valid[key] = data[dataKey];
                }
            }
        }

        Post.update(valid, {
            where: { 
                id: req.params.postId,
                userId: userId
            }
        }).then(function(post){
            //This isn't getting me the return post...
            var dict = {};
            if (post[0]) {
                dict = {message: 'Post updated'};
                res.statusCode = 200;
            } else {
                dict = {message: 'Unauthorized to modify this post'};
                res.statusCode = 401;
            }
            res.json(dict);
        }).catch(function(error){
            return next();
        });
    });

    router.delete('/posts/:postId', auth, function(req, res) {
        var data = req.body,
            userId = req.userId,
            valid = {};

        Post.destroy({
            where: { 
                id: req.params.postId,
                userId: userId
            }
        }).then(function(post){
            //This isn't getting me the return post...
            var dict = {};
            if (post) {
                dict = {message: 'Post deleted'};
                res.statusCode = 200;
            } else {
                dict = {message: 'Unauthorized to delete this post'};
                res.statusCode = 401;
            }
            res.json(dict);
        }).catch(function(error){
            return next();
        });
    });
};