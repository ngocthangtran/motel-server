const express = require('express');
const { createRenter, getRenter, repairRenter, deleteRenter } = require('../controllers/renter.controller');
const router = express.Router();
const auth = require('../middleware/auth');
const { validateRenter } = require('../middleware/validate/renter');

router.post('/create',
    [
        auth
    ],
    (req, res) => {
        createRenter(req, res);
    }
)

router.get('/',
    [auth],
    (req, res) => {
        getRenter(req, res);
    }
)

router.post('/repair',
    [
        auth,
        validateRenter
    ],
    (req, res) => {
        repairRenter(req, res)
    }
)

router.get('/delete/:renterId',
    [
        auth,
        validateRenter
    ],
    (req, res) => {
        deleteRenter(req, res)
    }
)

module.exports = router;