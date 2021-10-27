const { DataTypes } = require('sequelize');

module.exports = sequelize => {
  return sequelize.define(
    'roomType',
    {
      roomTypeId: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      description: {
        type: DataTypes.STRING,
      },
    },
    {
      timestamps: false,
    }
  );
};
