const { User, Posts, Ward, Province, PostImage, District, Room, Building, RoomType, Utility, sequelize } = require('../db');
const { Op } = require('sequelize');
const { unlink } = require('fs');
const sendMail = require('../utils/sendEmailPost');

const converData = (data, user) => data.map(item => {
  const { postId, postType, title, price, area, description,
    address, Ward: ward, postImages, updatedAt, liked, longitude, latitude, distance
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
    updatedAt, latitude, longitude, distance
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
    sendMail.sendMail(req, res, post.postId);
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
      postType: 'FOR_RENT',
      status: true
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
      postType: 'FOR_SHARE',
      status: true
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
          attributes: ["name", "wardId"],
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
        const { name, icon, utilityId } = item
        return {
          name, icon, utilityId
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
        wardId: ward.wardId,
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

const findPostV2 = async (req, res) => {
  const user = req.user;
  const {
    value, roomTypeId, postType, sort, page, priceStart, priceEnd, areaStart, areaEnd
  } = req.query;

  console.log(areaEnd)

  const data = await Posts.findAll({
    include: [
      {
        model: Ward,
        include: {
          model: District,
          include: Province
        }
      },
      {
        model: PostImage,
        as: "postImages"
      },
      user ? {
        model: User,
        as: "liked",
      } : {
        model: User,
      }
    ],
    where: {
      [Op.and]: [
        sequelize.literal(`MATCH (title, address) AGAINST ('"${value}"' IN BOOLEAN MODE)`),
        postType ? { postType } : undefined,
        roomTypeId ? { roomTypeId } : undefined,
        priceStart ? sequelize.literal(`price BETWEEN ${priceStart} and ${priceEnd}`) : undefined,
        areaStart ? sequelize.literal(`posts.area BETWEEN ${areaStart} and ${areaEnd}`) : undefined,
        { status: true }
      ]
    },
    order: sort ? sort === 'SORT_UP' ? [['price', 'ASC']] : [['price', 'DESC']] : [['createdAt', 'DESC']],
    // offset: page ? page * 10 - 10 : 0,
    // limit: 10,
  })
  const dataConvert = data.map(element => {
    const linkImage = {
      url: `${process.env.BASE_URL}/assets/${element.dataValues.postImages[0].name}_full.jpg`,
      thumbUrl: `${process.env.BASE_URL}/assets/${element.dataValues.postImages[0].name}_thumb.jpg`,
    }
    delete element.dataValues.nameImgae;
    delete element.dataValues.createdAt;
    delete element.dataValues.roomTypeId;
    delete element.dataValues.Ward;
    delete element.dataValues.postImages;

    const { liked } = element.dataValues;
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
    return {
      ...element.dataValues,
      linkImage, like
    }
  });
  res.send({
    count: data.length,
    data: dataConvert
  })
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
        postType,
        status: true
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
  const { postId } = req.params;
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
    longitude,
    utilityIds
  } = req.body;

  const fiter = (arr1True, arr2False) => {
    const arr = []
    arr1True.forEach((el) => {
      const a = arr2False.find(item => item === el);
      if (a === undefined)
        arr.push(el)
    })
    return arr
  }

  // prosessed repaird image
  let removeImage;
  try {
    var oldImage = await Posts.findOne({
      include: [
        {
          attributes: ["name"],
          model: PostImage,
          as: 'postImages'
        }
      ],
      where: {
        postId, userId
      }
    })
    oldImage = oldImage.postImages.map(el => {
      return el.name
    })
    var imagesOld = req.body.imagesOld;
    if (imagesOld) {
      if (typeof (imagesOld) === "string") {
        imagesOld = [imagesOld]
      }
      imagesOld = imagesOld.map(el => {
        var item = el.split('/');
        item = item[item.length - 1];
        return item.split('_')[0];
      })
      removeImage = fiter(oldImage, imagesOld)
    } else {
      removeImage = oldImage
    }
  } catch (error) {
    console.log("error on handiing repair images")
    return res.status(500).send({ message: "error on prosessing utilities" })
  }

  // prosessing repair utilityIds
  let addUtilities, removeUtilities
  try {
    var utilities = await Posts.findOne({
      include: [
        {
          model: Utility,
          as: 'postutilities',
        }
      ],
      where: {
        postId, userId
      }
    })
    utilities = utilities.postutilities.map(el => {
      return el.utilityId
    })
    removeUtilities = fiter(utilities, utilityIds)
    addUtilities = fiter(utilityIds, utilities)
  } catch (error) {
    console.log("error on prosessing utilities");
    return res.status(500).send({ message: "error on prosessing utilities" })
  }
  // prosessing data on database
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
    if (addUtilities.length !== 0) {
      const post = await Posts.findOne({
        include: ['postutilities', 'postImages'],
        where: {
          postId,
          userId: req.user.userId
        }
      })
      await post.addPostutilities(utilityIds)
    }


    // delete utilities
    if (removeUtilities.length !== 0) {
      try {
        removeUtilities.forEach(async el => {
          await sequelize.query(`delete from motel.posts_utilities where postId="${postId}" and utilityId="${el}"`)
        })
      } catch (error) {
        console.log("err on delete utilities")
      }
    }
    // delete images
    if (removeImage.length !== 0) {
      removeImage.forEach(async el => {
        await PostImage.destroy({
          where: {
            name: el,
            postId
          }
        })
      })
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
        // userId
      }
    })
    if (!post) {
      return res.status(403).send({
        status: 403,
        message: "The post does not belong to the user"
      })
    }
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
    sendMail.notificationLiked(post.User.email, req.user, postId)
    res.send(post)
  } catch (error) {
    console.log(error)
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

const findLocation = async (req, res) => {
  const distance = req.query.distance || 5
  const user = req.user;
  const { page,
    latitude,
    longitude,
  } = req.query;

  try {
    const clauses = {
      attributes: ["postId", "postType", "title", "price", "area", "description", "address", "createdAt", "updatedAt",
        "latitude", "longitude",
        [
          sequelize.literal(` 6371 * acos( cos( radians(${latitude}) ) * cos( radians( latitude ) ) * 
         cos( radians( longitude ) - radians(${longitude}) ) + sin( radians(${latitude}) ) * 
         sin( radians( latitude ) ) )`), 'distance'
        ]
      ],
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
      order: sequelize.literal('distance'),
      offset: page * 10 - 10,
      limit: 10,
      having: sequelize.literal(`distance < ${distance}`),
    };

    const data = await Posts.findAll({
      ...clauses
    })

    res.send({
      count: data.length,
      data: converData(data, user)
    })
  } catch (error) {
    console.log(error)
    res.status(500).send(error)
  }
}

const browsePosts = async (req, res) => {
  const { postId } = req.body
  try {
    const post = await Posts.findOne({
      where: {
        postId
      }
    })
    post.status = true;
    await post.save();
    res.send(post)
  } catch (error) {
    res.status.send(error)
  }
}

const getAllPost = async (req, res) => {
  const { page, status } = req.query;
  const countItem = 5;
  try {
    const post = await Posts.findAndCountAll({
      attributes: ["postId", "phone", "title"],
      include: [
        {
          model: Ward,
          include: {
            model: District,
            include: Province
          }
        }
      ],
      where: {
        status: status === "true" ? true : false
      },
      order: [['createdAt', 'DESC']],
      offset: page ? page * countItem - countItem : 1,
      limit: countItem
    })
    const data = post.rows.map(el => {
      const { postId, phone, title, Ward: ward } = el
      return {
        postId, phone, title, address: `${ward.name}, ${ward.District.name}, ${ward.District.Province.name}`
      }
    })
    res.send({
      page: ((post.count - post.count % countItem) / countItem) + 1,
      data
    })
  } catch (error) {
    console.log(error)
  }
}

const test = async (req, res) => {
  console.log(req.user)
}

module.exports = {
  createPost, getNewPost, viewPost,
  findAddress, getPostFor, findPostForValue,
  getPostForUser, deletePost, liked,
  repairPost, deleteImagePost,
  deleteUtilitie, test, unLike, getPostUserLike,
  findLocation, findPostV2, browsePosts, getAllPost
};
