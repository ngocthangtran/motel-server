
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
  Posts
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

  // ***Post
  // posts - PostImage
  Posts.hasMany(PostImage, { foreignKey: 'postId', as: 'postImages' });
  PostImage.belongsTo(Room, { foreignKey: 'postId' });

  // Post - wards
  Ward.hasOne(Posts, { foreignKey: 'wardId' })
  Posts.belongsTo(Ward, { foreignKey: 'wardId' })

  // post - user
  User.hasMany(Posts, { foreignKey: 'userId' });
  Posts.belongsTo(User, { foreignKey: 'userId' });

  // Post - Utilities
  Posts.belongsToMany(Utility, {
    through: "PostsUtilities",
    foreignKey: 'postId',
    as: 'postutilities'
  })

  Utility.belongsToMany(Posts, {
    through: 'PostsUtilities',
    foreignKey: 'utilityId'
  })

  // Post - Room type
  Posts.belongsTo(RoomType, { foreignKey: 'roomTypeId', as: 'roomType' })
  RoomType.hasMany(Posts, { foreignKey: 'roomTypeId' })
};

module.exports = { setAssociations };
