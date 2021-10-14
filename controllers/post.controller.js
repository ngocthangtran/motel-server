const { sequelize, PostImage, Post, Ward, Province, District, Room, Building } = require('../db');
const { post } = require('../routes/post.route');
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
    const { postId, title, price } = postData.dataValues
    const { Ward: ward, address } = Building.dataValues;


    // const { postId, postType, price, area, address, Ward: ward, title, postImages } = item.dataValues
    // const { name: nameImage } = postImages[0].dataValues;
    // const linkImage = {
    //   url: `${process.env.BASE_URL}/assets/${nameImage}_full.jpg`,
    //   thumbUrl: `${process.env.BASE_URL}/assets/${nameImage}_thumb.jpg`,
    // };
    // const { name, District: district } = ward
    return {
      postId, title, price, area, linkImage,
      address: `${address}, ${ward.name}, ${ward.District.name}, ${ward.District.Province.name}`
    }
  }, {})

  // console.log(post)
  res.send({ FOR_RENT: converData(FOR_RENT), FOR_SHARE: converData(FOR_SHARE) })
};

// const getMainPosts = async (req, res) => {

//   const clauses = {
//     joinTableAttributes: [],
//     include: ['postImages', {
//       model: Ward,
//       include: {
//         model: District,
//         include: {
//           model: Province
//         }
//       }
//     }],
//     order: [['createdAt', 'DESC']],
//     offset: 0,
//     limit: 10,
//   };
//   try {

//     var FOR_RENT = await Post.findAll({
//       where: {
//         postType: 'FOR_RENT'
//       },
//       attributes: ['postId', 'postType', "title", "price", "area", 'address', 'wardId', 'createdAt'],
//       ...clauses
//     })

//     const FOR_SHARE = await Post.findAll({
//       where: {
//         postType: 'FOR_SHARE'
//       },
//       attributes: ['postId', 'postType', "title", "price", "area", 'address', 'wardId', 'createdAt'],
//       ...clauses
//     })

//     const converData = data => data.map(item => {
//       const { postId, postType, price, area, address, Ward: ward, title, postImages } = item.dataValues
//       const { name: nameImage } = postImages[0].dataValues;
//       const linkImage = {
//         url: `${process.env.BASE_URL}/assets/${nameImage}_full.jpg`,
//         thumbUrl: `${process.env.BASE_URL}/assets/${nameImage}_thumb.jpg`,
//       };
//       const { name, District: district } = ward
//       return {
//         postId, title, postType, price, area, linkImage,
//         address: `${address}, ${name}, ${district.name}, ${district.Province.name}`
//       }
//     }, {})

//     res.send({
//       FOR_RENT: converData(FOR_RENT), FOR_SHARE: converData(FOR_SHARE)
//     })
//     // const newPosts = await Post.findAll({
//     //   order: [['updatedAt', 'DESC']],
//     //   attributes: ['postId', 'postType', "price", "area", 'address', 'wardId', 'updatedAt'],
//     //   ...clauses,
//     // });
//     // const wardId = newPosts.map(post => post.wardId)
//     // const address = await Ward.findAll(
//     //   {
//     //     include: [{
//     //       model: District,
//     //       include: {
//     //         model: Province
//     //       }
//     //     }],
//     //     where: {
//     //       // wardId: "00001"
//     //       wardId: { [Op.or]: wardId }
//     //     }
//     //   }
//     // )

//     // console.log(address)


//     // res.send(newPosts)
//     // const newPostIds = newPosts.map(np => np.postId);
//     // const forRentPosts = await Post.findAll({
//     //   where: { postType: 'FOR_RENT', postId: { [Op.notIn]: newPostIds } },
//     //   ...clauses,
//     // });
//     // const forSharePosts = await Post.findAll({
//     //   where: { postType: 'FOR_SHARE', postId: { [Op.notIn]: newPostIds } },
//     //   ...clauses,
//     // });
//     // res.send({ newPosts, forRentPosts, forSharePosts });
//   } catch (error) {
//     res.status(500).send({ error });
//   }
// };

module.exports = { createPost, getNewPost };
