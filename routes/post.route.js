const express = require('express');
const auth = require('../middleware/auth')
const { createPost, getNewPost } = require('../controllers/post.controller');
const { validateRoomId } = require('../middleware/validate/room');
const router = express.Router();


router.post('/',
  [
    auth,
    validateRoomId
  ],
  (req, res) => {
    createPost(req, res)
  })

router.get('/main', (req, res) => {
  getNewPost(req, res)
})
module.exports = router