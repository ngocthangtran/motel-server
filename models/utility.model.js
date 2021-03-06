const { DataTypes } = require('sequelize');

module.exports = sequelize => {
  return sequelize.define(
    'Utility',
    {
      utilityId: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      icon: {
        type: DataTypes.STRING,
      },
      description: {
        type: DataTypes.STRING,
      },
    },
    {
      timestamps: false,
      tableName: 'utility'
    }
  );
};
