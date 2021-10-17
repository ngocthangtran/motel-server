const { DataTypes } = require('sequelize');

module.exports = sequelize => {
  return sequelize.define('Posts', {
    postId: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    postType: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: [['FOR_RENT', 'FOR_SHARE']],
      },
    },
    area: {
      type: DataTypes.INTEGER,
      allowNull: false
    },

    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    price: {
      type: DataTypes.DECIMAL,
      allowNull: false,
    },
    deposit: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0
    },
    roomTypeId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        is: /(03|05|07|08|09|01[2|6|8|9])+([0-9]{8})\b/,
      },
    },
    waterCost: {
      type: DataTypes.DECIMAL(8, 2),
      allowNull: false,
    },
    electricityCost: {
      type: DataTypes.DECIMAL(8, 2),
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    address: {
      type: DataTypes.STRING,
      allowNull: false
    },
    wardId: {
      type: DataTypes.STRING,
      allowNull: false
    },
    latitude: {
      type: DataTypes.DECIMAL(10, 8),
      validate: {
        min: -90,
        max: 90,
      },
    },
    longitude: {
      type: DataTypes.DECIMAL(11, 8),
      validate: {
        min: -180,
        max: 180,
      },
    },
  });

};
