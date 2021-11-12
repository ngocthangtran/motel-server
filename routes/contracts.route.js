const express = require('express');
const { createContracts, getContract, getAContract, getAllContract, terminateContract, repairContracts, removeServiceRenter, deleteContract } = require('../controllers/contracts.controller');
const router = express.Router();
const auth = require('../middleware/auth');
const { validateContractId } = require('../middleware/validate/contracts');
const { validateRenters } = require('../middleware/validate/renter');
const { validateRoomId } = require('../middleware/validate/room');
const { validateServiceId, validateServiceArr } = require('../middleware/validate/services')

router.post("/create",
    [
        auth,
        validateRoomId,
        validateServiceArr,
        validateRenters
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
        validateServiceArr,
        validateRenters,
        validateContractId
    ],
    (req, res) => {
        repairContracts(req, res);
    }
)

router.delete('/remove/:contractId',
    [auth, validateContractId],
    (req, res) => {
        removeServiceRenter(req, res);
    }
)

router.delete('/delete/:contractId',
    [
        auth,
        validateContractId
    ],
    (req, res) => {
        deleteContract(req, res);
    }
)

module.exports = router;