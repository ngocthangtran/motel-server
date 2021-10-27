const { DataTypes } = require("sequelize");

module.exports = sequelize => {
  return sequelize.define("postImage", {
    postImageId: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: { type: DataTypes.STRING, allowNull: false },
  });
};
