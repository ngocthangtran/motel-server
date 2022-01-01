const express = require('express');
const auth = require('../middleware/auth');
const { createRoom, deleteRoom, getAllRoom, getARoom } = require('../controllers/room.controller');
const imageResize = require('../middleware/imageResize');
const { validateBuildId } = require('../middleware/validate/building');
const { validateRoomTypeId } = require('../middleware/validate/roomType');
const { validateRoomId } = require('../middleware/validate/room');
const router = express.Router();

router.post(
    '/create',
    [
        auth,
        validateBuildId,
        validateRoomTypeId
    ],
    (req, res) => {
        createRoom(req, res)
    }
)

router.get('/',
    [
        auth,
        validateBuildId
    ],
    (req, res) => {
        getAllRoom(req, res);
    }
)

router.get('/:roomId',
    [
        auth
    ], (req, res) => {
        getARoom(req, res);s
    }
)

router.delete('/delete',
    [
        auth,
        validateRoomId
    ],
    (req, res) => {
        deleteRoom(req, res)
    }
)

module.exports = router