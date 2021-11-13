const { User, Posts, Ward, Province, PostImage, District, Room, Building, RoomType, Utility, sequelize } = require('../db');
const { Op } = require('sequelize');
const { unlink } = require('fs')

const converData = (data, user) => data.map(item => {
  const { postId, postType, title, price, area, description,
    address, Ward: ward, postImages, updatedAt, liked
  } = item.dataValues;
  let linkImage;
  if (postImages[0]) {
    const { name: nameImage } = postImages[0];
    linkImage = {
      url: `${process.env.BASE_URL}/assets/${nameImage}_full.jpg`,
      thumbUrl: `${process.env.BASE_URL}/assets/${nameImage}_thumb.jpg`,
    }
  }

  let like = false;
  if (liked) {
    if (user) {
      liked.map(el => {
        if (el.userId === user.userId) {
          like = true;
          return
        }
      })
    }
  }
  // liked ? liked.length !== 0 ? like = true : like = false : like = false

  return {
    postId, title, postType, price, area, description, linkImage, like,
    address: `${address}, ${ward.name}, ${ward.District.name}, ${ward.District.Province.name}`,
    updatedAt
  }
}, {})

const createPost = async (req, res) => {
  const { userId } = req.user;
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

    latitude,
    longitude
  } = req.body;

  const utilityIds = req.utilities

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
    console.log(error)
    res.status(500).send(error)
  }
};

const getNewPost = async (req, res) => {
  const user = req.user;
  const FOR_RENT_clauses = {
    attributes: ["postId", "postType", "title", "price", "area", "description", "address", "createdAt", "updatedAt"],
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
      },
      user ? {
        model: User,
        as: "liked",
      } : {
        model: User,
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
    attributes: ["postId", "postType", "title", "price", "area", "description", "address", "createdAt", "updatedAt"],
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
      },
      user ? {
        model: User,
        as: "liked",
      } : {
        model: User,
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
      for_rent: converData(for_rent, user),
      for_share: converData(for_share, user)
    })
  } catch (error) {
    console.log(error)
    res.send(error)
  }

};

const viewPost = async (req, res) => {
  const { postId } = req.params
  const user = req.user;
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
        }, {
          model: User,
          as: 'liked'
        },
        {
          model: User
        }
      ],
      limit: 1,
      where: {
        postId
      }
    })
    const converData = (data, user) => {
      var { postImages, Ward: ward, postutilities, address, liked, User: user } = data[0].dataValues;

      let like = false;
      if (liked) {
        if (user) {
          liked.map(el => {
            if (el.userId === user.userId) {
              like = true;
              return
            }
          })
        }
      }
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

      delete data[0].dataValues.postutilities
      delete data[0].dataValues.Ward
      delete data[0].dataValues.wardId
      delete data[0].dataValues.createdAt
      delete data[0].dataValues.User
      delete data[0].dataValues.liked


      return {
        ...data[0].dataValues,
        userPostName: user.name,
        userPostImage: user.avatar,
        address, ward: ward.name, district: ward.District.name, province: ward.District.Province.name,
        postImages: images, utility: postutilities, like
      }
    }
    res.send({
      data: post.length !== 0 ? converData(post, user) : []
    })
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

const findPostForValue = async (req, res) => {
  const {
    value, roomTypeId, postType, sort, page, priceStart, priceEnd, areaStart, areaEnd
  } = req.query;
  let valuePrice = `and price BETWEEN ${priceStart} and ${priceEnd}`;
  let valueArea = `and area BETWEEN ${areaStart} and ${areaEnd}`;
  let valueSort;
  if (!sort) {
    valueSort = 'createdAt DESC'
  } else if (sort === 'SORT_UP') {
    valueSort = 'price ASC'
  } else {
    valueSort = 'price DESC'
  }

  let valuePage;
  if (!page) {
    valuePage = `LIMIT 0, 10`
  } else {
    valuePage = `LIMIT ${page * 10 - 10}, 10`
  }

  try {
    const data = await sequelize.query(`select * from 
    (
    select wards.wardId,concat( wards.name,", ", districts.name, ", ",  provinces.name) as address,
    wards.name as ward,districts.name as districts, provinces.name as provinces
    from motel.wards, motel.districts, motel.provinces
    where wards.districtId = districts.districtId and districts.provinceId = provinces.provinceId) myAddress,
    (
    select wards.wardId, 
    posts.postId, posts.title, posts.address, posts.postType, posts.price, posts.area, posts.description, post_images.name as nameImgae, posts.createdAt, posts.roomTypeId, posts.updatedAt
    from motel.wards, motel.posts, motel.post_images
    where wards.wardId = posts.wardId and posts.postId = post_images.postId
    group by postId
    ) myPosts
    
    where myPosts.wardId = myAddress.wardId and (myAddress.address like "%${value}%" or myPosts.title like "%${value}%" or myPosts.address like "%${value}%")
    ${postType ? `and postType='${postType}'` : ''} 
    ${roomTypeId ? `and roomTypeId='${roomTypeId}'` : ''}
    ${priceStart ? valuePrice : ''}
    ${areaEnd ? valueArea : ''}
    order by ${valueSort}
    ${valuePage}
    ;`
    );
    const dataConvert = data[0].map(element => {
      // console.log(element);
      const linkImage = {
        url: `${process.env.BASE_URL}/assets/${element.nameImgae}_full.jpg`,
        thumbUrl: `${process.env.BASE_URL}/assets/${element.nameImgae}_thumb.jpg`,
      }
      delete element.nameImgae;
      delete element.createdAt;
      delete element.roomTypeId;
      return {
        ...element,
        linkImage
      }
    });
    res.send({
      count: data[0].length,
      data: dataConvert
    })
  } catch (error) {
    res.status(500).send(error)
  }
}

const getPostFor = async (req, res) => {
  const user = req.user;
  const { postType, page } = req.query;
  try {
    const clauses = {
      attributes: ["postId", "postType", "title", "price", "area", "description", "address", "createdAt", "updatedAt"],
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
        },
        {
          model: User,
          as: "liked"
        }
      ],
      where: {
        postType
      },
      order: [['createdAt', 'DESC']],
      offset: page * 10 - 10,
      limit: 10,
    };

    const data = await Posts.findAll({
      ...clauses
    })

    res.send({
      postType,
      count: data.length,
      data: converData(data, user)
    })
  } catch (error) {
    res.status(500).send(error)
  }
}

const getPostForUser = async (req, res) => {
  const { userId } = req.user
  const clauses = {
    attributes: ["postId", "postType", "title", "price", "area", "description", "address", "updatedAt"],
    include: [
      {
        model: User,
        where: {
          userId
        }
      },
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
    order: [['createdAt', 'DESC']],
    offset: 0,
    limit: 10,
  };
  try {
    const post = await Posts.findAll({
      ...clauses
    })
    res.send({
      count: post.length,
      post: converData(post)
    })
  } catch (error) {

  }
}

const repairPost = async (req, res) => {
  const { postId } = req.params
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
    latitude,
    longitude,
    utilityIds
  } = req.body;
  const images = req.images.map(i => {
    return {
      name: i, postId
    }
  });
  try {
    await Posts.update({
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
    }, {

      where: {
        postId,
        userId: req.user.userId
      },
    })
    if (images.length !== 0) {
      await PostImage.bulkCreate(images)
    }
    if (utilityIds.length !== 0) {
      const post = await Posts.findOne({
        include: ['postutilities', 'postImages'],
        where: {
          postId,
          userId: req.user.userId
        }
      })
      await post.addPostutilities(utilityIds)
    }
    res.send({
      status: 200,
      message: "reqair post complete with postId: " + postId
    })

  } catch (error) {
    console.log(error)
    res.status(500).send(error)
  }
}

const deletePost = async (req, res) => {
  const { postId } = req.params;
  const { userId } = req.user;
  let nameImage = []
  try {
    const post = await Posts.findOne({
      include: ['postutilities', 'postImages'],
      where: {
        postId,
        userId
      }
    })
    post.dataValues.postImages.forEach(element => {
      nameImage.push(`${element.name}_full.jpg`)
      nameImage.push(`${element.name}_thumb.jpg`)
    });
    await post.destroy();
    res.send(post)
  } catch (error) {
    console.log(error)
    res.status(500).send(error)
  } finally {
    if (nameImage.length != 0) {
      Promise.all(
        nameImage.map(
          file =>
            new Promise((res, rej) => {
              try {
                unlink(`./public/assets/${file}`, (err) => {
                  if (err) return console.log("loi xoa")
                  console.log("delete complete img on server")
                });
              } catch (err) {
                console.log(err)
              }
            })
        ))
    }
  }
}

const deleteImagePost = async (req, res) => {
  const { nameImage: name, postId } = req.query;
  try {
    const result = await PostImage.destroy({
      where: {
        name,
        postId
      }
    })
    res.send({
      status: 200,
      message: `delete ${result} Image`
    })
  } catch (error) {
    console.log(error)
    res.status(500).send(error)
  }
}

const deleteUtilitie = async (req, res) => {
  const { postId, utilityId } = req.query;
  if (!postId || !utilityId) return res.status(400).send({
    status: 400,
    message: "postId and utilityId is a pair"
  })
  try {
    const result = await sequelize.query(`delete from motel.posts_utilities where postId="${postId}" and utilityId="${utilityId}"`)
    res.send({
      status: 200,
      message: `delete 1 utilityId:${utilityId}`
    })
  } catch (error) {
    res.status(500).send(error)
  }
}

const liked = async (req, res) => {
  const { postId } = req.query;
  const { userId } = req.user;
  try {
    const post = await Posts.findOne({
      include: {
        model: User
      },
      where: {
        postId
      }
    })
    await post.addLiked(userId);
    res.send(post)
  } catch (error) {
    res.status(500).send(error);
  }
}

const unLike = async (req, res) => {
  const { postId } = req.query;
  const { userId } = req.user
  try {
    await sequelize.query(`delete from user_like_posts where postId="${postId}" and userId="${userId}"`);
    res.send({
      status: 200,
      message: `unlike complete`
    })
  } catch (error) {
    console.log(error)
    res.status(500).send(error);
  }
}

const getPostUserLike = async (req, res) => {
  const { userId } = req.user;
  var { page } = req.query
  if (!page) {
    page = 1
  }
  try {
    const clauses = {
      attributes: ["postId", "postType", "title", "price", "area", "description", "address", "createdAt", "updatedAt"],
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
        },
        {
          model: User,
          as: "liked",
          where: {
            userId
          }
        }
      ],

      order: [['createdAt', 'DESC']],
      offset: page * 10 - 10,
      limit: 10,
    };
    const post = await Posts.findAll({
      ...clauses
    })
    if (post.length != 0) {
      return res.send({
        count: post.length,
        data: converData(post, req.user)
      })
    }
    res.send({
      count: 0,
      data: []
    })
  } catch (error) {
    console.log("error at get user's posts like")
    console.log(error)
    res.status(500).send({
      status: 500,
      message: "Error", error
    })
  }
}

const test = async (req, res) => {
  const post = await Posts.findAll({
    include: [
      {
        model: User,
        as: 'liked',
      }
    ]
  })
  res.send(post)
}

module.exports = {
  createPost, getNewPost, viewPost,
  findAddress, getPostFor, findPostForValue,
  getPostForUser, deletePost, liked,
  repairPost, deleteImagePost,
  deleteUtilitie, test, unLike, getPostUserLike
};
