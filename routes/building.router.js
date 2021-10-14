const express = require('express')
const router = express.Router();
const { createBuilding, getBuilding, deleteBulding, repairBuilding } = require('../controllers/building.controller');
const auth = require('../middleware/auth')
const { validateWardId } = require('../middleware/validate/ward')


router.post('/create',
    [
        auth,
        validateWardId
    ],
    (req, res) => {
        createBuilding(req, res)
    }
)

router.get('/',
    [
        auth
    ],
    (req, res) => {
        getBuilding(req, res)
    }
)

router.delete('/delete',
    [
        auth
    ],
    (req, res) => {
        deleteBulding(req, res)
    }
)

router.post('/repair',
    [
        auth
    ],
    (req, res) => {
        repairBuilding(req, res)
    }
)

module.exports = router