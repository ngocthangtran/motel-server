const setAssociations = ({
  User,
  Utility,
  RoomType,
  Post,
  PostImage,
  Province,
  District,
  Ward,
}) => {
  // Post - RoomType
  Post.belongsTo(RoomType, { foreignKey: 'roomTypeId', as: 'roomType' });
  RoomType.hasMany(Post, { foreignKey: 'roomTypeId' });

  // Post - Utility
  Post.belongsToMany(Utility, {
    through: 'PostUtilities',
    foreignKey: 'postId',
    as: 'utilities',
  });
  Utility.belongsToMany(Post, {
    through: 'PostUtilities',
    foreignKey: 'utilityId',
  });

  // Post - User
  Post.belongsTo(User, { foreignKey: 'userId' });
  User.hasMany(Post, { foreignKey: 'userId' });

  // Post - PostImage
  Post.hasMany(PostImage, { foreignKey: 'postId', as: 'postImages' });
  PostImage.belongsTo(Post, { foreignKey: 'postId' });

  //Post - ward
  Ward.hasMany(Post, { foreignKey: 'wardId' })
  Post.belongsTo(Ward, { foreignKey: "wardId" })

  // Province - District - Ward
  Province.hasMany(District, { foreignKey: 'provinceId' });
  District.belongsTo(Province, { foreignKey: 'provinceId' });
  District.hasMany(Ward, { foreignKey: 'districtId' });
  Ward.belongsTo(District, { foreignKey: 'districtId' });

  // Post - Address
  // Post.
};

module.exports = { setAssociations };
