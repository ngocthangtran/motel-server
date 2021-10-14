const express = require('express');
const auth = require('../middleware/auth')
const { createPost } = require('../controllers/post.controller');
const { validateRoomId } = require('../middleware/validate/room');
const router = express.Router();


router.post('/',
  [
    // auth,
    validateRoomId
  ],
  (req, res) => {
    createPost(req, res)
  })

module.exports = router