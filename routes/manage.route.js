const { application } = require('express');
const express = require('express');
const { getContractTakeEffect } = require('../controllers/manage.controller');
const auth = require('../middleware/auth');
const router = express.Router();

router.get('/effective',
    [
        auth
    ],
    (req, res) => {
        getContractTakeEffect(req, res);
    }
)

module.exports = router;