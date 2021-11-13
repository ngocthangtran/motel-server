const { Room } = require('../../db')

const validateRoomId = async (req, res, next) => {
    const roomId = req.body.roomId || req.params.roomId || req.query.roomId;

    if (!roomId) return res.status(400).send({ message: "roomId is required" });
    const room = await Room.findByPk(roomId)
    if (!room) {
        return res
            .status(400)
            .send({ error: 'cannot find room with id ' + roomId });
    }
    req.roomId = roomId;
    next();
}

module.exports = { validateRoomId }