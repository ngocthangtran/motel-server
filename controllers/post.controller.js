const { User, Posts, Ward, Province, PostImage, District, Room, Building, RoomType, Utility, sequelize } = require('../db');
const { Op } = require('sequelize');
const { unlink } = require('fs')

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

      delete data[0].dataValues.postutilities
      delete data[0].dataValues.Ward
      delete data[0].dataValues.wardId
      delete data[0].dataValues.createdAt
      delete data[0].dataValues.updatedAt

      return {
        ...data[0].dataValues,
        address, ward: ward.name, district: ward.District.name, province: ward.District.Province.name,
        postImages: images, utility: postutilities
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
    posts.postId, posts.title, posts.address, posts.postType, posts.price, posts.area, posts.description, post_images.name as nameImgae, posts.createdAt, posts.roomTypeId
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
  const { postType, page } = req.query;
  try {
    const clauses = {
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
      data: converData(data)
    })
  } catch (error) {
    res.status(500).send(error)
  }
}

const getPostForUser = async (req, res) => {
  const { userId } = req.user
  const clauses = {
    attributes: ["postId", "postType", "title", "price", "area", "description", "address"],
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

const liked = (req, res) => {

}

module.exports = {
  createPost, getNewPost, viewPost,
  findAddress, getPostFor, findPostForValue,
  getPostForUser, deletePost, liked
};
