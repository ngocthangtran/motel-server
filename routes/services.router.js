const express = require('express');
const { createService, test, getServiceForUser, getServiceForBuilding, deleteService, repairService, viewAservice } = require('../controllers/services.contrller');
const router = express.Router();
const auth = require('../middleware/auth')
const { validateBuildId } = require('../middleware/validate/building');
const { validateFeeBaseOnsId } = require('../middleware/validate/feeBaseOns');
const { validateServiceId } = require('../middleware/validate/services');

router.post('/create',
    [
        auth,
        validateFeeBaseOnsId
    ],
    (req, res) => {
        createService(req, res);
    }
)

router.get('/user',
    [
        auth
    ],
    (req, res) => {
        getServiceForUser(req, res);
    }
)

router.get('/building/:buildingId',
    [
        auth,
        validateBuildId
    ],
    (req, res) => {
        getServiceForBuilding(req, res);
    }
)

router.delete('/delete/:serviceId',
    [auth],
    (req, res) => {
        deleteService(req, res)
    })

router.post('/repair',
    [
        auth,
        validateServiceId
    ],
    (req, res) => {
        repairService(req, res)
    })

router.get('/get/:serviceId',
    [
        auth,
        validateServiceId
    ],
    (req, res) => {
        viewAservice(req, res);
    }
)

module.exports = router;