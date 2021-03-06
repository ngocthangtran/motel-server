const express = require('express');
const { login, createUser } = require('../controllers/auth.controller');
const auth = require('../middleware/auth');
const router = express.Router();

router.post('/', (req, res) => {
  login(req, res);
});

module.exports = router;
