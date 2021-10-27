const { DataTypes } = require('sequelize');

module.exports = sequelize => {
  return sequelize.define(
    'Provinces',
    {
      provinceId: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      type: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      timestamps: false,
      tableName: 'provinces',
    }
  );
};
