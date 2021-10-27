const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    return sequelize.define('Contracts', {
        contractId: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        userId: {
            type: DataTypes.UUID,
            allowNull: false
        },
        roomId: {
            type: DataTypes.UUID,
            allowNull: false
        },
        startAt: {
            type: DataTypes.DATEONLY,
            defaultValue: DataTypes.NOW
        },
        endAt: {
            type: DataTypes.DATEONLY
        },
        paymentCycle: {
            type: DataTypes.TEXT,
            // defaultValue: DataTypes.TEXT("1 Tháng"),
        },
        price: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: false
        },
        deposit: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: false
        },
        status: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
    })
}