const { DataTypes } = require('sequelize')

module.exports = (sequelize) => {
    return sequelize.define(
        "Building",
        {
            buildingId: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true
            },
            userId: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
            },
            roomId: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false
            },
            address: {
                type: DataTypes.STRING,
                allowNull: false
            },
            openTime: {
                type: DataTypes.TIME,
            },
            closeTime: {
                type: DataTypes.TIME
            },
            wardId: {
                type: DataTypes.STRING,
                allowNull: false
            }
        })

}