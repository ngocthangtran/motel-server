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
  Posts,
  Services,
  FeeBaseOn,
  Contracts,
  Bill,
  Bills_services,
  Renter,
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
  Building.hasMany(Room, { foreignKey: 'buildingId' });
  Room.belongsTo(Building, { foreignKey: 'buildingId' });

  // Province - District - Ward
  Province.hasMany(District, { foreignKey: 'provinceId' });
  District.belongsTo(Province, { foreignKey: 'provinceId' });
  District.hasMany(Ward, { foreignKey: 'districtId' });
  Ward.belongsTo(District, { foreignKey: 'districtId' });

  //building - ward
  Ward.hasMany(Building, { foreignKey: 'wardId' });
  Building.belongsTo(Ward, { foreignKey: 'wardId' });

  //building - user

  User.hasMany(Building, { foreignKey: 'userId' });
  Building.belongsTo(User, { foreignKey: 'userId' });

  // ***Post
  // posts - PostImage
  Posts.hasMany(PostImage, { foreignKey: 'postId', as: 'postImages' });
  PostImage.belongsTo(Room, { foreignKey: 'postId' });

  // Post - wards
  Ward.hasOne(Posts, { foreignKey: 'wardId' });
  Posts.belongsTo(Ward, { foreignKey: 'wardId' });

  // post - user
  User.hasMany(Posts, { foreignKey: 'userId' });
  Posts.belongsTo(User, { foreignKey: 'userId' });

  // Post - Utilities
  Posts.belongsToMany(Utility, {
    through: 'PostsUtilities',
    foreignKey: 'postId',
    as: 'postutilities',
  });

  Utility.belongsToMany(Posts, {
    through: 'PostsUtilities',
    foreignKey: 'utilityId',
  });

  // Post - Room type
  Posts.belongsTo(RoomType, { foreignKey: 'roomTypeId', as: 'roomType' });
  RoomType.hasMany(Posts, { foreignKey: 'roomTypeId' });

  // manager

  // Service - user
  User.hasMany(Services, {
    foreignKey: "userId"
  })
  Services.belongsTo(User, { foreignKey: "userId" })

  //service - building
  Services.belongsToMany(Building, {
    through: 'ServicesBuilding',
    foreignKey: 'ServiceId',
    as: 'serviceBuilding',
  });

  Building.belongsToMany(Services, {
    through: 'ServicesBuilding',
    foreignKey: 'buildingId',
  });

  // Services - fee base on
  FeeBaseOn.hasOne(Services, {
    foreignKey: 'fee_base_ons_id'
  })
  Services.belongsTo(FeeBaseOn, {
    foreignKey: "fee_base_ons_id",
    as: 'createFeeBasseOn'
  })

  // Services - contracts
  Contracts.belongsToMany(Services, {
    through: 'ContractsServices',
    foreignKey: 'contractId',
    as: 'contractServices',
  });
  Services.belongsToMany(Contracts, {
    through: 'ContractsServices',
    foreignKey: 'serviceId',
  });

  // Contract - bill
  Contracts.hasMany(Bill, {
    foreignKey: 'contractId',
  });
  Bill.belongsTo(Contracts, {
    foreignKey: 'contractId',
  });

  // Bill - bill_services
  Bills_services.belongsToMany(Bill, {
    through: 'bill_bill_service',
    foreignKey: 'billServiceId',
    as: 'bill',
  });
  Bill.belongsToMany(Bills_services, {
    through: 'bill_bill_service',
    foreignKey: 'billId',
  });
  // bill_service - services
  Services.hasMany(Bills_services, {
    foreignKey: 'serviceId',
  });
  Bills_services.belongsTo(Services, { foreignKey: 'serviceId' });
  // contract - bill
  Contracts.hasMany(Bills_services, {
    foreignKey: 'contractId',
  });
  Bills_services.belongsTo(Contracts, { foreignKey: 'contractId' });

  // contract - room
  Room.hasMany(Contracts, { foreignKey: "roomId" });
  Contracts.belongsTo(Room, { foreignKey: 'roomId' })

  // contract - user
  User.hasMany(Contracts, { foreignKey: 'userId' });
  Contracts.belongsTo(User, { foreignKey: "userId" })

  // Renter - contract
  Renter.belongsToMany(Contracts, {
    through: 'ContractRenter',
    foreignKey: 'renterId',
  });
  Contracts.belongsToMany(Renter, {
    through: "ContractRenter",
    foreignKey: "contractId"
  })

  //Renter - user
  User.hasMany(Renter, { foreignKey: 'userId' });
  Renter.belongsTo(User, { foreignKey: "userId" })
};

module.exports = { setAssociations };
