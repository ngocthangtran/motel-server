const { DataTypes } = require('sequelize')

module.exports = (sequelize) => {
    return sequelize.define(
        "services",
        {
            serviceId: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false
            },
            price: {
                type: DataTypes.DECIMAL(12, 2),
                allowNull: false
            },
            unit: {
                type: DataTypes.STRING,
                allowNull: false
            },
            icon: {
                type: DataTypes.STRING
            },
            description: {
                type: DataTypes.STRING
            },
            startValue: {
                type: DataTypes.INTEGER
            }
        }
    )
}