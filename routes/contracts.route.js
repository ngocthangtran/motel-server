const express = require('express');
const { createContracts } = require('../controllers/contracts.controller');
const router = express.Router();
const auth = require('../middleware/auth');

router.post("/create",
    [
        auth
    ],
    (req, res) => {
        createContracts(req, res)
    }
)

module.exports = router;