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
  UserLikePost,
  ContractService
}) => {
  // Room - RoomType
  Room.belongsTo(RoomType, { foreignKey: 'roomTypeId', as: 'roomType' });
  RoomType.hasMany(Room, { foreignKey: 'roomTypeId' });

  // ROOM - Utility
  Room.belongsToMany(Utility, {
    through: 'room_utilities',
    foreignKey: 'roomId',
    as: 'utilities',
  });
  Utility.belongsToMany(Room, {
    through: 'room_utilities',
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

  // // post - user
  User.hasMany(Posts, { foreignKey: 'userId' });
  Posts.belongsTo(User, { foreignKey: 'userId' });

  // Post - Utilities
  Posts.belongsToMany(Utility, {
    through: "posts_utilities",
    foreignKey: 'postId',
    as: 'postutilities'
  })

  Utility.belongsToMany(Posts, {
    through: 'posts_utilities',
    foreignKey: 'utilityId'
  })

  // Post - Room type
  Posts.belongsTo(RoomType, { foreignKey: 'roomTypeId', as: 'roomType' })
  RoomType.hasMany(Posts, { foreignKey: 'roomTypeId' })

  // manager

  // Service - user
  User.hasMany(Services, {
    foreignKey: "userId"
  })
  Services.belongsTo(User, { foreignKey: "userId" })

  //service - building
  Services.belongsToMany(Building, {
    through: 'services_building',
    foreignKey: "serviceId",
    as: 'serviceBuilding',
  });

  Building.belongsToMany(Services, {
    through: "services_building",
    foreignKey: "buildingId",
    as:"buildingService"
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
  Contracts.hasMany(ContractService, {
    // through: 'contracts_services',
    foreignKey: "contractId",
    as: 'contractServices'
  })
  ContractService.belongsTo(ContractService, {
    foreignKey: 'contractId'
  })
  Services.hasMany(ContractService, {
    // through: "contracts_services",
    foreignKey: 'serviceId'
  });

  ContractService.belongsTo(Services, {
    foreignKey: 'serviceId'
  })


  // Contract - bill
  Contracts.hasMany(Bill, {
    foreignKey: 'contractId'
  })
  Bill.belongsTo(Contracts, {
    foreignKey: 'contractId'
  })

  // Bill - bill_services
  Bills_services.belongsToMany(Bill, {
    through: "bill_bill_service",
    foreignKey: "billServiceId",
  })
  Bill.belongsToMany(Bills_services, {
    through: "bill_bill_service",
    foreignKey: "billId",
    as: 'billService'
  })
  // bill_service - services
  Services.hasMany(Bills_services, {
    foreignKey: "serviceId",
  })
  Bills_services.belongsTo(Services, { foreignKey: 'serviceId' })
  // contract - bill
  Contracts.hasMany(Bills_services, {
    foreignKey: "contractId"
  })
  Bills_services.belongsTo(Contracts, { foreignKey: "contractId" })

  // contract - room
  Room.hasMany(Contracts, { foreignKey: "roomId" });
  Contracts.belongsTo(Room, { foreignKey: 'roomId' })

  // contract - user
  User.hasMany(Contracts, { foreignKey: 'userId' });
  Contracts.belongsTo(User, { foreignKey: "userId" })

  // Renter - contract
  Renter.belongsToMany(Contracts, {
    through: "contract_renter",
    foreignKey: "renterId"
  })
  Contracts.belongsToMany(Renter, {
    through: "contract_renter",
    foreignKey: "contractId",
    as: 'contractRenter'
  })

  //Renter - user
  User.hasMany(Renter, { foreignKey: 'userId' });
  Renter.belongsTo(User, { foreignKey: "userId" })

  //Post - user (many to many)

  Posts.belongsToMany(User, {
    through: "user_like_post",
    foreignKey: "postId",
    as: "liked"
  })

  User.belongsToMany(Posts, {
    through: "user_like_post",
    foreignKey: "userId",
  })
}

module.exports = { setAssociations }