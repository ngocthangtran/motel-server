const { User } = require(".");

const setAssociations = ({

  Room,
  PostImage,
  Utility,
  Building,
  Ward,
  RoomType,
  Province,
  District,
  User
}) => {
  // Post - RoomType
  Room.belongsTo(RoomType, { foreignKey: 'roomTypeId', as: 'roomType' });
  RoomType.hasMany(Room, { foreignKey: 'roomTypeId' });

  // Post - Utility
  Room.belongsToMany(Utility, {
    through: 'RoomUtilities',
    foreignKey: 'roomId',
    as: 'utilities',
  });
  Utility.belongsToMany(Room, {
    through: 'RoomUtilities',
    foreignKey: 'utilityId',
  });

  // // Post - User
  // Post.belongsTo(User, { foreignKey: 'userId' });
  // User.hasMany(Post, { foreignKey: 'userId' });

  // Post - PostImage
  Room.hasMany(PostImage, { foreignKey: 'roomId', as: 'postImages' });
  PostImage.belongsTo(Room, { foreignKey: 'roomId' });

  // Province - District - Ward
  Province.hasMany(District, { foreignKey: 'provinceId' });
  District.belongsTo(Province, { foreignKey: 'provinceId' });
  District.hasMany(Ward, { foreignKey: 'districtId' });
  Ward.belongsTo(District, { foreignKey: 'districtId' });


  //building - room
  Building.hasMany(Room, { foreignKey: "buildingId" });
  Room.belongsTo(Building, { foreignKey: "buildingId" })

  //building - ward
  Ward.hasMany(Building, { foreignKey: 'wardId' })
  Building.belongsTo(Ward, { foreignKey: "wardId" });

  //building - user

  User.hasMany(Building, { foreignKey: "userId" });
  Building.belongsTo(User, { foreignKey: 'userId' })
};

module.exports = { setAssociations };
