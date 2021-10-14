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
  User,
  Post
}) => {
  // Room - RoomType
  Room.belongsTo(RoomType, { foreignKey: 'roomTypeId', as: 'roomType' });
  RoomType.hasMany(Room, { foreignKey: 'roomTypeId' });

  // ROOM - Utility
  Room.belongsToMany(Utility, {
    through: 'RoomUtilities',
    foreignKey: 'roomId',
    as: 'utilities',
  });
  Utility.belongsToMany(Room, {
    through: 'RoomUtilities',
    foreignKey: 'utilityId',
  });

  // room - PostImage
  Room.hasMany(PostImage, { foreignKey: 'roomId', as: 'postImages' });
  PostImage.belongsTo(Room, { foreignKey: 'roomId' });

  //room - post
  Room.hasOne(Post, { foreignKey: "roomId" })

  //building - room
  Building.hasMany(Room, { foreignKey: "buildingId" });
  Room.belongsTo(Building, { foreignKey: "buildingId" })

  // Province - District - Ward
  Province.hasMany(District, { foreignKey: 'provinceId' });
  District.belongsTo(Province, { foreignKey: 'provinceId' });
  District.hasMany(Ward, { foreignKey: 'districtId' });
  Ward.belongsTo(District, { foreignKey: 'districtId' });

  //building - ward
  Ward.hasMany(Building, { foreignKey: 'wardId' })
  Building.belongsTo(Ward, { foreignKey: "wardId" });

  //building - user

  User.hasMany(Building, { foreignKey: "userId" });
  Building.belongsTo(User, { foreignKey: 'userId' })
};

module.exports = { setAssociations };
