const express = require('express');
const {
  createPost,
  getAllPosts,
  getMainPosts,
} = require('../controllers/post.controller');
const auth = require('../middleware/auth');
const router = express.Router();
const multer = require('multer');
const imageResize = require('../middleware/imageResize');
const { validateRoomTypeId } = require('../middleware/validate/roomType');
const { validateUtilityIds } = require('../middleware/validate/utility');
const { validateProvinceId } = require('../middleware/validate/provinces');
const { validateWardId } = require('../middleware/validate/ward');

const MAX_IMAGE_COUNT = 6;

const upload = multer({
  dest: 'uploads/',
  limits: { fieldSize: 25 * 1024 * 1024 },
});

router.post(
  '/',
  [
    // auth,
    upload.array('images', MAX_IMAGE_COUNT),
    imageResize,
    validateRoomTypeId,
    validateUtilityIds,
    validateProvinceId,
    validateWardId
  ],
  (req, res) => {
    createPost(req, res);
  }
);

router.get('/main', (req, res) => {
  getMainPosts(req, res);
});

router.get('/:page', (req, res) => {
  getAllPosts(req, res);
});

module.exports = router;
