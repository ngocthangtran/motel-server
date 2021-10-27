const { User, Posts, Ward, Province, PostImage, District, Room, Building, RoomType, Utility } = require('../db');
const { Op } = require('sequelize');

const converData = data => data.map(item => {
  const { postId, postType, title, price, area, description, address, Ward: ward, postImages } = item.dataValues
  let linkImage;
  if (postImages[0]) {
    const { name: nameImage } = postImages[0];
    linkImage = {
      url: `${process.env.BASE_URL}/assets/${nameImage}_full.jpg`,
      thumbUrl: `${process.env.BASE_URL}/assets/${nameImage}_thumb.jpg`,
    }
  }
  return {
    postId, title, postType, price, area, description, linkImage,
    address: `${address}, ${ward.name}, ${ward.District.name}, ${ward.District.Province.name}`
  }
}, {})

const createPost = async (req, res) => {
  const { userId } = req.user;
  console.log(userId)
  const {
    postType,
    area,
    title,
    price,
    deposit,
    roomTypeId,
    phone,
    waterCost,
    electricityCost,
    description,
    address,
    wardId,
    utilityIds,
    latitude,
    longitude
  } = req.body

  const images = req.images.map(i => {
    return {
      name: i
    }
  });

  try {
    const post = await Posts.create({
      userId,
      postType,
      area,
      title,
      price,
      deposit,
      roomTypeId,
      phone,
      waterCost,
      electricityCost,
      description,
      address,
      wardId,
      latitude,
      longitude,
      postImages: images,
    }, {
      include: ['postImages']
    })
    await post.addPostutilities(utilityIds)
    res.send(post)
  } catch (error) {
    res.status(500).send(error)
  }
};

const getNewPost = async (req, res) => {
  const FOR_RENT_clauses = {
    attributes: ["postId", "postType", "title", "price", "area", "description", "address"],
    include: [
      {
        attributes: ['name'],
        model: PostImage,
        as: 'postImages',
        limit: 1
      },
      {
        attributes: ['name'],
        model: Ward,
        include: {
          attributes: ['name'],
          model: District,
          include: {
            model: Province,
            attributes: ['name'],
          }
        }
      }
    ],
    where: {
      postType: 'FOR_RENT'
    },
    order: [['createdAt', 'DESC']],
    offset: 0,
    limit: 10,
  };
  const FOR_SHARE_clauses = {
    attributes: ["postId", "postType", "title", "price", "area", "description", "address"],
    include: [
      {
        attributes: ['name'],
        model: PostImage,
        as: 'postImages',
        limit: 1
      },
      {
        attributes: ['name'],
        model: Ward,
        include: {
          attributes: ['name'],
          model: District,
          include: {
            model: Province,
            attributes: ['name'],
          }
        }
      }
    ],
    where: {
      postType: 'FOR_SHARE'
    },
    order: [['createdAt', 'DESC']],
    offset: 0,
    limit: 10,
  };
  try {
    const for_rent = await Posts.findAll({
      ...FOR_RENT_clauses
    })
    const for_share = await Posts.findAll({
      ...FOR_SHARE_clauses
    })
    res.send({
      for_rent: converData(for_rent),
      for_share: converData(for_share)
    })
  } catch (error) {
    console.log(error)
    res.send(error)
  }

};

const viewPost = async (req, res) => {
  const { postId } = req.params
  try {
    const post = await Posts.findAll({
      include: [
        {
          attributes: ["name"],
          model: PostImage,
          as: 'postImages'
        },
        {
          model: Ward,
          attributes: ["name"],
          include: {
            model: District,
            attributes: ["name"],
            include: {
              model: Province,
              attributes: ["name"],
            }
          }
        },
        {
          model: Utility,
          as: 'postutilities',
          attributes: ["name", "icon"]
        }
      ],
      limit: 1,
      where: {
        postId
      }
    })
    const converData = data => {
      var { postImages, Ward: ward, postutilities, address } = data[0].dataValues;

      const images = postImages.map(item => {
        const { name } = item
        return {
          url: `${process.env.BASE_URL}/assets/${name}_full.jpg`,
          thumbUrl: `${process.env.BASE_URL}/assets/${name}_thumb.jpg`,
        }
      })
      postutilities = postutilities.map(item => {
        const { name, icon } = item
        return {
          name, icon
        }
      })
      address = `${address}, ${ward.name}, ${ward.District.name}, ${ward.District.Province.name}`

      delete data[0].dataValues.postutilities
      delete data[0].dataValues.Ward
      return {
        ...data[0].dataValues, postImages: images, utility: postutilities, address: address
      }
    }
    res.send(converData(post))
  } catch (error) {
    console.log(error)
    res.status(500).send(error)
  }

}

const findAddress = async (req, res) => {
  const { wardId, roomTypeId, postType, sort } = req.query;
  console.log({ wardId, roomTypeId, postType, sort })
  try {
    const post = await Posts.findAll({
      where: {
        wardId,
        roomTypeId,
        postType
      },
      include: [
        {
          attributes: ['name'],
          model: PostImage,
          as: 'postImages',
          limit: 1
        },
        {
          attributes: ['name'],
          model: Ward,
          include: {
            attributes: ['name'],
            model: District,
            include: {
              model: Province,
              attributes: ['name'],
            }
          }
        }
      ],
      order: !sort ? [['createdAt', 'DESC']] : sort === "SORT_UP" ? [['price', "ASC"]] : [['price', "DESC"]],
    })
    res.send(converData(post))
  } catch (error) {
    res.status(500).send(error)
  }


}

module.exports = {
  createPost, getNewPost, viewPost,
  findAddress,
};
