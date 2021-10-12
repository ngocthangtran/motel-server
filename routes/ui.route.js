const express = require('express');
const postModel = require('../models/post.model');
const router = express.Router();
const { getProvinces, getDistricts, getWards } = require('../controllers/ui.controller')

router.get('/provinces', (req, res) => {
    getProvinces(req, res)
})

router.get('/districts/:provinceId', (req, res) => {
    getDistricts(req, res)
})

router.get("/wards/:districtId", (req, res) => {
    getWards(req, res)
})

module.exports = router