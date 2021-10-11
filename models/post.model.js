const { DataTypes } = require('sequelize');

module.exports = sequelize => {
  const Post = sequelize.define('Post', {
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
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    provinceId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    districtId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    wardId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    addrDetails: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    area: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    price: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    deposit: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    waterCost: {
      type: DataTypes.DECIMAL(8, 2),
      allowNull: false,
    },
    electricityCost: {
      type: DataTypes.DECIMAL(8, 2),
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        is: /(03|05|07|08|09|01[2|6|8|9])+([0-9]{8})\b/,
      },
    },
    details: {
      type: DataTypes.STRING,
      allowNull: false,
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
  Post.prototype.toJSON = function () {
    var values = Object.assign({}, this.get());

    values['postImages'] = values['postImages'].map(img => {
      return {
        url: `${process.env.BASE_URL}/assets/${img.name}_full.jpg`,
        thumbUrl: `${process.env.BASE_URL}/assets/${img.name}_thumb.jpg`,
      };
    });
    return values;
  };
  return Post;
};
