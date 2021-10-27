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
      month: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      contractId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
    },
    {
      tableName: 'bill',
    }
  );
};
