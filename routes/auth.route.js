const express = require('express');
const { login } = require('../controllers/auth.controller');
const auth = require('../middleware/auth');
const router = express.Router();

router.post('/', (req, res) => {
  console.log(req);
  login(req, res);
});

module.exports = router;
