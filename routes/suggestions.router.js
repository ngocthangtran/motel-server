const express = require('express');
const { suggestionsAddress } = require('../controllers/suggestions.controller');
const router = express.Router();

router.get('/address', (req, res) => {
    suggestionsAddress(req, res);
})

module.exports = router