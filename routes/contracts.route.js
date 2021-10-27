const express = require('express');
const { createContracts, getContract, getAContract, getAllContract, terminateContract } = require('../controllers/contracts.controller');
const router = express.Router();
const auth = require('../middleware/auth');
const { validateContractId } = require('../middleware/validate/contracts');
const { validateRenter } = require('../middleware/validate/renter');
const { validateRoomId } = require('../middleware/validate/room');
const { validateServiceId, validateServiceArr } = require('../middleware/validate/services')

router.post("/create",
    [
        auth,
        validateRoomId,
        validateServiceArr,
        validateRenter
    ],
    (req, res) => {
        createContracts(req, res)
    }
)

router.get('/',
    [
        auth
    ],
    (req, res) => {
        getAllContract(req, res);
    }
)

router.get('/:contractId',
    [
        auth,
        validateContractId
    ],
    (req, res) => {
        getAContract(req, res);
    }
)

router.get('/terminate/:contractId',
    [
        auth,
        validateContractId
    ],
    (req, res) => {
        terminateContract(req, res);
    }
)

router.post('/repair/:contractId',
    [
        auth,
        validateRoomId,
        validateServiceArr,
        validateRenter
    ],
    (req, res) => {
        
    }
)
module.exports = router;