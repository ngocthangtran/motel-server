const express = require('express');
const auth = require('../middleware/auth')
const { createPost, getNewPost, viewPost, findAddress, getPostFor, findPostForValue, getPostForUser, deletePost } = require('../controllers/post.controller');
const { validateRoomTypeId } = require('../middleware/validate/roomType');
const { validateWardId } = require('../middleware/validate/ward');
const imageResize = require('../middleware/imageResize');
const multer = require('multer');
const { validateUtilityIds } = require('../middleware/validate/utility');
const { validatePostId } = require('../middleware/validate/posts');
const router = express.Router();


const MAX_IMAGE_COUNT = 6;

const upload = multer({
  dest: 'uploads/',
  limits: { fieldSize: 25 * 1024 * 1024 },
});

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

router.get('/main', (req, res) => {
  getNewPost(req, res)
})

router.get('/viewpost/:postId', (req, res) => {
  viewPost(req, res)
})

router.get('/find',
  [
    // validateWardId,
    // validateRoomTypeId
  ]
  , (req, res) => {
    const { wardId } = req.query;
    if (wardId) {
      findAddress(req, res);
    } else {
      findPostForValue(req, res);
    }
  }
)

router.get('/type', (req, res) => {
  getPostFor(req, res);
})

router.get('/user',
  [auth],
  (req, res) => {
    getPostForUser(req, res);
  }
)

router.delete('/delete/:postId',
  [
    auth,
    // validatePostId
  ], (req, res) => {
    deletePost(req, res)
  }
)


module.exports = router