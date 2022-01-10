const express = require('express');
const auth = require('../middleware/auth')
const { createPost, getNewPost, viewPost, findAddress, getPostFor, findPostForValue, getPostForUser, deletePost, repairPost, deleteImagePost, deleteUtilitie, liked, test, unLike, getPostUserLike, findLocation, findPostV2, browsePosts } = require('../controllers/post.controller');
const { validateRoomTypeId } = require('../middleware/validate/roomType');
const { validateWardId } = require('../middleware/validate/ward');
const imageResize = require('../middleware/imageResize');
const multer = require('multer');
const { validateUtilityIds } = require('../middleware/validate/utility');
const { validatePostId } = require('../middleware/validate/posts');
const authCheck = require('../middleware/authCheck');
const router = express.Router();


const MAX_IMAGE_COUNT = 60;

const upload = multer({
  dest: 'uploads/',
  limits: { fieldSize: 25 * 1024 * 1024 },
});

router.use((req, res, next) => {

  next();
})

router.post('/',
  [
    auth,
    upload.array('images', MAX_IMAGE_COUNT),
    imageResize,
    validateRoomTypeId,
    validateWardId,
    validateUtilityIds
  ],
  (req, res) => {
    createPost(req, res)
  })

router.get('/main', [authCheck], (req, res) => {
  getNewPost(req, res)
})

router.get('/viewpost/:postId', [authCheck], (req, res) => {
  viewPost(req, res)
})

router.get('/find',
  [
    // validateWardId,
    // validateRoomTypeId
    authCheck
  ]
  , (req, res) => {
    const { wardId } = req.query;
    if (wardId) {
      findAddress(req, res);
    } else {
      // findPostForValue(req, res);
      findPostV2(req, res);
    }
  }
)

router.get('/type', [authCheck], (req, res) => {
  getPostFor(req, res);
})

router.get('/user',
  [auth],
  (req, res) => {
    getPostForUser(req, res);
  }
)

router.post('/repair/:postId',
  [
    auth,
    upload.array('images', MAX_IMAGE_COUNT),
    imageResize,
    validatePostId
  ], (req, res) => {
    repairPost(req, res);
  }
)

router.delete('/delete/:postId',
  [
    auth,
    validatePostId
  ], (req, res) => {
    deletePost(req, res)
  }
)

router.delete('/image',
  [auth, validatePostId],
  (req, res) => {
    deleteImagePost(req, res);
  }
)

router.delete('/utility', [auth], (req, res) => {
  deleteUtilitie(req, res);
})

router.get('/liked', [auth, validatePostId],
  (req, res) => {
    liked(req, res);
  }
)

router.get('/unliked',
  [auth, validatePostId],
  (req, res) => {
    unLike(req, res);
  }
)

router.get('/userliked',
  [
    auth
  ],
  (req, res) => {
    getPostUserLike(req, res);
  }
)
router.get('/location', [
  authCheck
], (req, res) => {
  findLocation(req, res);
})

router.post('/browseposts', [
  validatePostId
], (req, res) => {
  browsePosts(req, res)
})

router.get('/test', [auth], (req, res) => {
  test(req, res);
})




module.exports = router