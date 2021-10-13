const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    return sequelize.define(
        "Fee_base_on",
        {
            fee_base_on_id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false
            },
            description: {
                type: DataTypes.STRING
            }
        }
    )
}