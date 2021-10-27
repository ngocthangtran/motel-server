const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    return sequelize.define('Renter', {
        renterId: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        phone: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                is: /(03|05|07|08|09|01[2|6|8|9])+([0-9]{8})\b/,
            },
        },
        birthday: {
            type: DataTypes.DATEONLY,
            allowNull: false
        },
        numberCard: {
            type: DataTypes.STRING,
            allowNull: false
        },
        issuedOn: {
            type: DataTypes.DATEONLY,
            allowNull: false
        }
    }, {
        tableName: 'renter'
    })
}