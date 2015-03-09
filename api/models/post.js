module.exports = function(sequelize, DataTypes) {
    'use strict';

    var bcrypt = require('bcrypt'),
        Post = sequelize.define('Post',
        {
            name: {
                type: DataTypes.TEXT
            },
            content: {
                type: DataTypes.TEXT
            },
            createdAt: {type: DataTypes.DATE, defaultValue: DataTypes.NOW},
            updatedAt: DataTypes.DATE,
        },
        {
            classMethods: {
                associate: function(models) {
                    Post.belongsTo(models.User)
                }
            }
        });

    return Post;
};