const { DataTypes } = require('sequelize');

module.exports = sequelize => {
  return sequelize.define(
    'Bill',
    {
      billId: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      contractId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      contractId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      sumPrice: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false
      }
    },
    {
      tableName: 'bill',
    }
  );
};
