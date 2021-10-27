const { DataTypes } = require('sequelize');

module.exports = sequelize => {
  return sequelize.define('User', {
    userId: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      validate: {
        isEmail: true,
      },
    },
    avatar: {
      type: DataTypes.STRING,
    },
    facebookId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    googleId: {
      type: DataTypes.STRING,
    },
    area: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isIn: [['HCM', 'DN', 'HN']],
      },
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        is: /(03|05|07|08|09|01[2|6|8|9])+([0-9]{8})\b/,
      },
    },
  }, {
    tableName: 'user'
  });
};
