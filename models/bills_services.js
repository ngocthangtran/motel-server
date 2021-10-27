const { DataTypes } = require('sequelize');

module.exports = sequelize => {
  return sequelize.define(
    'Bills_services',
    {
      billServiceId: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      lastValue: {
        type: DataTypes.INTEGER,
      },
      currentValue: {
        type: DataTypes.INTEGER,
      },
      quantily: {
        type: DataTypes.INTEGER,
      },
      date: {
        type: DataTypes.DATEONLY,
      },
    },
    {
      tableName: 'bills_services',
    }
  );
};
