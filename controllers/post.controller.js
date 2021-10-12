const { sequelize, Post, RoomType, Utility } = require('../db');
const { post } = require('../routes/post.route');
const { Op } = require('sequelize');

const createPost = async (req, res) => {
  const {
    title,
    address,
    area,
    price,
    deposit,
    waterCost,
    electricityCost,
    phone,
    details,
    postType,
    roomTypeId,
    utilityIds,
    provinceId,
    districtId
  } = req.body;

  const images = req.images.map(i => {
    return { name: i };
  });

  try {
    const post = await Post.create(
      {
        // userId: req.user.userId,
        userId: "e493adc1-cd37-4055-a965-b0cecede3373",
        title,
        address,
        area,
        price,
        deposit,
        waterCost,
        electricityCost,
        phone,
        details,
        postType,
        roomTypeId,
        postImages: images,
        provinceId,
        districtId
      },
      { include: ['postImages'] }
    );
    await post.addUtilities(utilityIds);
    // await post.addPostImages(images);
    res.send({ post });
  } catch (error) {
    console.log(error);
    res.status(500).send({ error });
  }
};

const getAllPosts = async (req, res) => { };

const getMainPosts = async (req, res) => {
  const clauses = {
    joinTableAttributes: [],
    include: ['roomType', 'utilities', 'postImages'],
    offset: 0,
    limit: 10,
  };
  try {
    const newPosts = await Post.findAll({
      order: [['updatedAt', 'DESC']],
      ...clauses,
    });
    const newPostIds = newPosts.map(np => np.postId);
    const forRentPosts = await Post.findAll({
      where: { postType: 'FOR_RENT', postId: { [Op.notIn]: newPostIds } },
      ...clauses,
    });
    const forSharePosts = await Post.findAll({
      where: { postType: 'FOR_SHARE', postId: { [Op.notIn]: newPostIds } },
      ...clauses,
    });
    res.send({ newPosts, forRentPosts, forSharePosts });
  } catch (error) {
    res.status(500).send({ error });
  }
};

module.exports = { createPost, getAllPosts, getMainPosts };
