const { User, sequelize, PostImage, Post, Ward, Province, District, Room, Building } = require('../db');
const { Op } = require('sequelize');

const createPost = async (req, res) => {
  const {
    roomId,
    description,
    postType,
    title,
    phone,
    latitude,
    longitude,
    price
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
      price,
      description,
      postType,
      title,
      phone,
      latitude,
      longitude
    })
    res.send(post.dataValues)
  } catch (error) {
    console.log(error);
    res.status(500).send({ error });
  }
};

const getNewPost = async (req, res) => {
  const FOR_RENT_clauses = {
    joinTableAttributes: [],
    include: ["postImages", {
      model: Post,
      where: {
        postType: "FOR_RENT"
      }
    }, {
        model: Building,
        include: {
          model: Ward,
          include: {
            model: District,
            include: Province
          }
        }
      }],
    order: [['createdAt', 'DESC']],
    offset: 0,
    limit: 10,
  };

  const FOR_SHARE_clauses = {
    joinTableAttributes: [],
    include: ["postImages", {
      model: Post,
      where: {
        postType: "FOR_SHARE"
      }
    }, {
        model: Building,
        include: {
          model: Ward,
          include: {
            model: District,
            include: Province
          }
        }
      }],
    order: [['createdAt', 'DESC']],
    offset: 0,
    limit: 10,
  };

  const FOR_RENT = await Room.findAll({
    ...FOR_RENT_clauses
  })

  const FOR_SHARE = await Room.findAll({
    ...FOR_SHARE_clauses
  })

  const converData = data => data.map(item => {
    const { area, postImages, Post: postData, Building } = item.dataValues
    const { name: nameImage } = postImages[0].dataValues;
    const linkImage = {
      url: `${process.env.BASE_URL}/assets/${nameImage}_full.jpg`,
      thumbUrl: `${process.env.BASE_URL}/assets/${nameImage}_thumb.jpg`,
    }
    const { postId, title, price, postType } = postData.dataValues
    const { Ward: ward, address } = Building.dataValues;

    return {
      postId, title, postType, price, area, linkImage,
      address: `${address}, ${ward.name}, ${ward.District.name}, ${ward.District.Province.name}`
    }
  }, {})
  res.send({ FOR_RENT: converData(FOR_RENT), FOR_SHARE: converData(FOR_SHARE) })
};

const viewPost = async (req, res) => {
  const { postId } = req.params
  const room = await Room.findAll({
    attributes: ["area"],
    include: ['postImages', 'utilities',
      {
        model: Post,
        where: {
          postId
        }
      },
      {
        model: Building,
        include: [{
          model: Ward,
          include: {
            model: District,
            include: Province
          }
        }, {
          model: User
        }]
      }
    ],

  })
  const converData = data => {
    const { area, postImages, utilities: dv, Post: post, Building: building } = data[0].dataValues;

    const represent = building.User.name

    const address = `${building.address}, ${building.Ward.name} - ${building.Ward.District.name}, ${building.Ward.District.Province.name}`

    const { title, price, phone, description } = post;

    const images = postImages.map(item => {
      const { name } = item
      return {
        url: `${process.env.BASE_URL}/assets/${name}_full.jpg`,
        thumbUrl: `${process.env.BASE_URL}/assets/${name}_thumb.jpg`,
      }
    })
    const utilities = dv.map(item => {
      const { name, icon } = item
      return {
        name, icon
      }
    })
    return {
      title, price, area, represent, phone, address, description,
      images, utilities,
    }
  }

  res.send(converData(room))
}

module.exports = { createPost, getNewPost, viewPost };
