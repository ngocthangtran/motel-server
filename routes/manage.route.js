const { application } = require('express');
const express = require('express');
const { getContractTakeEffect, singleClosing, serviceOfRoom, createBuild, billservice, createBill } = require('../controllers/manage.controller');
const auth = require('../middleware/auth');
const { validateContractId } = require('../middleware/validate/contracts');
const { validateRoomId } = require('../middleware/validate/room');
const router = express.Router();

router.get('/contract/effective',
    [
        auth
    ],
    (req, res) => {
        getContractTakeEffect(req, res);
    }
)

router.get('/roomservice',
    [
        auth,
        validateRoomId
    ],
    (req, res) => {
        serviceOfRoom(req, res);
    }
)

router.post('/singleclosing',
    [
        auth,
        validateContractId
    ],
    (req, res) => {
        singleClosing(req, res);
    }
)

router.get('/billservice',
    [
        auth,
        validateRoomId
    ], (req, res) => {
        billservice(req, res)
    }

)

router.post('/createbill',
    [
        auth
    ],
    (req, res) => {
        createBill(req, res);
    }
)

module.exports = router;