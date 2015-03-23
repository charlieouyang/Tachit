module.exports = function(sequelize, DataTypes) {
    'use strict';

    var Click = sequelize.define('Click',
        {
            click_placement: {
                type: DataTypes.TEXT
            },
            createdAt: {type: DataTypes.DATE, defaultValue: DataTypes.NOW}
        });

    return Click;
};