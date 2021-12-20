const express = require('express');
const { loginWithUser, createUser } = require('../controllers/userLogin.controller');
const auth = require('../middleware/auth');
const router = express.Router();

router.post('/create', (req, res) => {
    createUser(req, res);
})

router.post('/', (req, res) => {
    loginWithUser(req, res);
})

router.get('/test', (req, res) => {
    console.log(req.headers)
})
module.exports = router;