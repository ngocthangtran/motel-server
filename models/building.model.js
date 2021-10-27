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
                defaultData: DataTypes.TIME("06:00")
            },
            closeTime: {
                type: DataTypes.TIME("23:00")
            },
            wardId: {
                type: DataTypes.STRING,
                allowNull: false
            }
        }, {
        tableName: 'building'
    })

}