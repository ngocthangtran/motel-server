const express = require('express');
const { loginWithUser, createUser, checkToken } = require('../controllers/userLogin.controller');
const auth = require('../middleware/auth');
const router = express.Router();

router.post('/create', (req, res) => {
    createUser(req, res);
})

router.post('/', (req, res) => {
    loginWithUser(req, res);
})

router.post('/checkToken',
    [auth]
    , (req, res) => {
        res.send({ message: "ok" })
    }
)


router.get('/test', (req, res) => {
    console.log(req.headers)
})
module.exports = router;