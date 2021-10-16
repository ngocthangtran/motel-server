const { User, Posts, Ward, Province, PostImage, District, Room, Building, RoomType } = require('../db');
const { Op } = require('sequelize');

const converData = data => data.map(item => {
  const { area, postImages, Post: postData, Building } = item.dataValues
  const { name: nameImage } = postImages[0].dataValues;
  const linkImage = {
    url: `${process.env.BASE_URL}/assets/${nameImage}_full.jpg`,
    thumbUrl: `${process.env.BASE_URL}/assets/${nameImage}_thumb.jpg`,
  }
  const { postId, title, price, postType, description } = postData.dataValues
  const { Ward: ward, address } = Building.dataValues;

  return {
    postId, title, postType, price, area, description, linkImage,
    address: `${address}, ${ward.name}, ${ward.District.name}, ${ward.District.Province.name}`
  }
}, {})

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
    const posts = await Posts.create({
      roomId,
      price,
      description,
      postType,
      title,
      phone,
      latitude,
      longitude
    })
    res.send(posts.dataValues)
  } catch (error) {
    console.log(error);
    res.status(500).send({ error });
  }
};

const getNewPost = async (req, res) => {
  const FOR_RENT_clauses = {
    joinTableAttributes: [],
    include: ["postImages", {
      model: Posts,
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
      model: Posts,
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


  res.send({ FOR_RENT: converData(FOR_RENT), FOR_SHARE: converData(FOR_SHARE) })
};

const viewPost = async (req, res) => {
  const { postId } = req.params
  const room = await Room.findAll({
    attributes: ["area"],
    include: ['postImages', 'utilities',
      {
        model: Posts,
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
      }, 'roomType'
    ],

  })
  const converData = data => {
    const { area, postImages, utilities: dv, Post: post, Building: building, roomType } = data[0].dataValues;

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
      title, price, area, represent, phone, address, description, roomType: roomType.dataValues.name,
      images, utilities,
    }
  }

  res.send(converData(room))
}

const findAddress = async (req, res) => {
  const { wardId, roomTypeId, postType, sort } = req.query;

  try {
    const room = await Room.findAll({
      include: [
        {
          model: PostImage,
          as: 'postImages'
        },
        {
          model: Posts,
          where: {
            postType
          },
        },
        {
          model: Building,
          where: {
            wardId
          },
          include: {
            model: Ward,
            include: {
              model: District,
              include: Province
            }
          }
        },
        {
          model: RoomType,
          as: 'roomType',
          where: {
            roomTypeId
          }
        }
      ],
      where: {
        status: true
      },
      order: [['createdAt', 'DESC']],
      offset: 0,
      limit: 10,
    })
    let data;

    if (sort === 'SORT_DOWN') {

      data = converData(room).sort((a, b) => {
        if (a.price > b.price) {
          return -1
        }
        return 0
      })
      res.send(data);
      return
    }
    if (sort === 'SORT_UP') {
      data = converData(room).sort((a, b) => {
        if (a.price < b.price) {
          return -1
        }
        return 0
      })
      res.send(data);
      return;
    }
    data = converData(room)
    res.send(data)
  } catch (error) {
    res.status(500).send(error)
  }


}

const filterPost = async (req, res) => {
  console.log(req.query)
}

module.exports = {
  createPost, getNewPost, viewPost,
  findAddress,
  filterPost
};
