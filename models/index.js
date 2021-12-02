const User = require('./user.model');
const Utility = require('./utility.model');
const RoomType = require('./roomType.model');
const PostImage = require('./postImage.model');
const Province = require('./province.model');
const District = require('./district.model');
const Ward = require('./ward.model');
const Building = require('./building.model');
const FeeBaseOn = require('./feeBaseOn.model');
const Room = require('./room.model');
const Services = require('./services.model')
const Posts = require('./post.model')
const Bill = require('./bill.model');
const Bills_services = require('./bills_services');
const Contracts = require('./contract.model');
const Renter = require('./renter.model');
const UserLikePost = require('./userLikePost.model');
const ContractService = require('./contract_service.model');

module.exports = {
  User,
  Utility,
  RoomType,
  PostImage,
  Province,
  District,
  Ward,
  Building,
  Room,
  Posts,

  FeeBaseOn,
  Services,
  Bill,
  Bills_services,
  Contracts,
  Renter,
  UserLikePost,
  ContractService
};
