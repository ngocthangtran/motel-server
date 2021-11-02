const { DataTypes } = require('sequelize');

module.exports = sequelize => {
    return sequelize.define(
        'user_like_post'
    )
};
