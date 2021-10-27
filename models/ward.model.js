const { DataTypes } = require('sequelize');

module.exports = sequelize => {
  return sequelize.define(
    'wards',
    {
      wardId: {
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
      // districtId: {
      //   type: DataTypes.STRING,
      //   allowNull: false,
      // },
    },
    {
      timestamps: false,
    }
  );
};
