const { Room } = require('../../db')

const validateRoomId = async(req, res, next) => {
    const { roomId } = req.body;
    const room = await Room.findByPk(roomId)
    if (!room) {
        return res
            .status(400)
            .send({ error: 'cannot find room with id ' + roomId });
    }
    req.roomId = roomId;
    next();
}

module.exports = {validateRoomId}