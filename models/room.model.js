const { DataTypes } = require('sequelize');
module.exports = (sequelize) => {
    return sequelize.define(
        "Room",
        {
            roomId: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true
            },
            buildingId: {
                type: DataTypes.UUID,
                allowNull: false
            },
            area: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false
            },
            deposit: {
                type: DataTypes.DECIMAL(12, 2),
                defaultValue: 0
            },
            status: {
                type: DataTypes.BOOLEAN,
                defaultValue: false
            },
            roomTypeId: {
                type: DataTypes.UUID,
                allowNull: false
            }
        }
    )
}