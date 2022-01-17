const express = require('express')
const router = express.Router();
const { createBuilding, getBuilding, deleteBulding, repairBuilding, addService, removeService, getABuilding } = require('../controllers/building.controller');
const auth = require('../middleware/auth')
const { validateWardId } = require('../middleware/validate/ward');
const { validateServiceId } = require('../middleware/validate/services');
const { validateBuildId } = require('../middleware/validate/building');



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

router.delete('/delete/:buildingId',
    [
        auth,
        validateBuildId
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

router.post('/addservice',
    [
        auth,
        validateServiceId,
        validateBuildId
    ],
    (req, res) => {
        addService(req, res)
    }
)

router.delete('/removeservice',
    [auth],
    (req, res) => {
        removeService(req, res);
    }
)

router.get('/:buildingId', [
    auth, validateBuildId
], (req, res) => {
    getABuilding(req, res);
})

module.exports = router