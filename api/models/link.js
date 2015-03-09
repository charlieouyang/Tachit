module.exports = function(sequelize, DataTypes) {
    'use strict';

    var Link = sequelize.define('Link',
        {
            link_url: {
                type: DataTypes.TEXT
            },
            amazon_url: {
                type: DataTypes.TEXT
            },
            name: {
                type: DataTypes.TEXT
            },
            description: {
                type: DataTypes.TEXT
            },
            media_type: {
                type: DataTypes.TEXT
            },
            user_id: {
                type: DataTypes.TEXT
            },
            createdAt: {type: DataTypes.DATE, defaultValue: DataTypes.NOW}
        });

    return Link;
};