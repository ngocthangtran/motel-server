const express = require('express');
const { createContracts, getContract, getAContract, getAllContract } = require('../controllers/contracts.controller');
const router = express.Router();
const auth = require('../middleware/auth');
const { validateContractId } = require('../middleware/validate/contracts');
const { validateRoomId } = require('../middleware/validate/room');
const { validateServiceId, validateServiceArr } = require('../middleware/validate/services')

router.post("/create",
    [
        auth,
        validateRoomId,
        validateServiceArr
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

router.post('/terminate',
    [auth],
    (req, res) => {

    }
)

module.exports = router;