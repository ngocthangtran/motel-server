const { DataTypes } = require("sequelize");

module.exports = sequelize => {
  return sequelize.define("PostImages", {
    postImageId: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: { type: DataTypes.STRING, allowNull: false },
  }, {
    tableName: 'post_images'
  });
};
