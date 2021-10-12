const express = require('express');
const postModel = require('../models/post.model');
const router = express.Router();
const { getProvinces, getDistricts, getWards, getRoomType, getUtilities } = require('../controllers/ui.controller')

// render ui address
router.get('/provinces', (req, res) => {
    getProvinces(req, res)
})

router.get('/districts/:provinceId', (req, res) => {
    getDistricts(req, res)
})

router.get("/wards/:districtId", (req, res) => {
    getWards(req, res)
})

// reder ui room type
router.get("/roomtype", (req, res) => {
    getRoomType(req, res);
})

//render ui utilities
router.get("/utilities", (req, res) => {
    getUtilities(req, res);
})

module.exports = router