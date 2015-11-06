module.exports = function(sequelize, DataTypes) {
    'use strict';

    var Link = sequelize.define('Link',
        {
            link_url: {
                type: DataTypes.TEXT
            },
            amazon_key_actual: {
                type: DataTypes.TEXT
            },
            amazon_key_preview: {
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
            user_name: {
                type: DataTypes.TEXT
            },
            uniquefilename: {
                type: DataTypes.TEXT
            },
            uniqueactualfilename: {
                type: DataTypes.TEXT
            },
            fieldfilename: {
                type: DataTypes.TEXT
            },
            final: {
                type: DataTypes.TEXT
            },
            createdAt: {type: DataTypes.DATE, defaultValue: DataTypes.NOW}
        });

    return Link;
};