module.exports = function(sequelize, DataTypes) {
    'use strict';

    var Email = sequelize.define('Email',
        {
            email_address: {
                type: DataTypes.TEXT
            },
            createdAt: {type: DataTypes.DATE, defaultValue: DataTypes.NOW}
        });

    return Email;
};