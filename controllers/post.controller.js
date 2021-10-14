const { sequelize, Post, Ward, Province, District, Room } = require('../db');
const { post } = require('../routes/post.route');
const { Op } = require('sequelize');

const createPost = async (req, res) => {
  const {
    roomId,
    discription,
    postType,
    title,
    phone,
    latitude,
    longitude
  } = req.body;

  try {
    await Room.update({
      status: true
    },
      {
        where: {
          roomId,
        }
      }
    )
    const post = await Post.create({
      roomId,
      discription,
      postType,
      title,
      phone,
      latitude,
      longitude
    })
    res.send(post)
  } catch (error) {
    console.log(error);
    res.status(500).send({ error });
  }
};

const getAllPosts = async (req, res) => { };

const getMainPosts = async (req, res) => {

  const clauses = {
    joinTableAttributes: [],
    include: ['postImages', {
      model: Ward,
      include: {
        model: District,
        include: {
          model: Province
        }
      }
    }],
    order: [['createdAt', 'DESC']],
    offset: 0,
    limit: 10,
  };
  try {

    var FOR_RENT = await Post.findAll({
      where: {
        postType: 'FOR_RENT'
      },
      attributes: ['postId', 'postType', "title", "price", "area", 'address', 'wardId', 'createdAt'],
      ...clauses
    })

    const FOR_SHARE = await Post.findAll({
      where: {
        postType: 'FOR_SHARE'
      },
      attributes: ['postId', 'postType', "title", "price", "area", 'address', 'wardId', 'createdAt'],
      ...clauses
    })

    const converData = data => data.map(item => {
      const { postId, postType, price, area, address, Ward: ward, title, postImages } = item.dataValues
      const { name: nameImage } = postImages[0].dataValues;
      const linkImage = {
        url: `${process.env.BASE_URL}/assets/${nameImage}_full.jpg`,
        thumbUrl: `${process.env.BASE_URL}/assets/${nameImage}_thumb.jpg`,
      };
      const { name, District: district } = ward
      return {
        postId, title, postType, price, area, linkImage,
        address: `${address}, ${name}, ${district.name}, ${district.Province.name}`
      }
    }, {})

    res.send({
      FOR_RENT: converData(FOR_RENT), FOR_SHARE: converData(FOR_SHARE)
    })
    // const newPosts = await Post.findAll({
    //   order: [['updatedAt', 'DESC']],
    //   attributes: ['postId', 'postType', "price", "area", 'address', 'wardId', 'updatedAt'],
    //   ...clauses,
    // });
    // const wardId = newPosts.map(post => post.wardId)
    // const address = await Ward.findAll(
    //   {
    //     include: [{
    //       model: District,
    //       include: {
    //         model: Province
    //       }
    //     }],
    //     where: {
    //       // wardId: "00001"
    //       wardId: { [Op.or]: wardId }
    //     }
    //   }
    // )

    // console.log(address)


    // res.send(newPosts)
    // const newPostIds = newPosts.map(np => np.postId);
    // const forRentPosts = await Post.findAll({
    //   where: { postType: 'FOR_RENT', postId: { [Op.notIn]: newPostIds } },
    //   ...clauses,
    // });
    // const forSharePosts = await Post.findAll({
    //   where: { postType: 'FOR_SHARE', postId: { [Op.notIn]: newPostIds } },
    //   ...clauses,
    // });
    // res.send({ newPosts, forRentPosts, forSharePosts });
  } catch (error) {
    res.status(500).send({ error });
  }
};

module.exports = { createPost, getAllPosts, getMainPosts };
