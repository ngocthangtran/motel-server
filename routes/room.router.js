const express = require('express');
const auth = require('../middleware/auth');
const multer = require('multer');
const { createRoom } = require('../controllers/room.controller');
const imageResize = require('../middleware/imageResize');
const { validateBuildId } = require('../middleware/validate/building');
const { validateRoomTypeId } = require('../middleware/validate/roomType');
const { validateUtilityIds } = require('../middleware/validate/utility');
const router = express.Router();

const MAX_IMAGE_COUNT = 6;

const upload = multer({
    dest: 'uploads/',
    limits: { fieldSize: 25 * 1024 * 1024 },
});

router.post(
    '/create',
    [
        // auth,
        upload.array('images', MAX_IMAGE_COUNT),
        imageResize,
        validateBuildId,
        validateUtilityIds,
        validateRoomTypeId
    ],
    (req, res) => {
        createRoom(req, res)
    }
)

module.exports = router