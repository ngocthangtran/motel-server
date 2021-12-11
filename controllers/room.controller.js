const {
    Room
} = require('../db');

const createRoom = async (req, res) => {
    const {
        buildingId,
        area,
        name,
        deposit,
        roomTypeId,
        utilityIds
    } = req.body;

    try {
        const room = await Room.create({
            buildingId,
            name,
            area,
            deposit,
            roomTypeId,
        }
        )
        await room.addUtilities(utilityIds)
        res.send(room)
    } catch (error) {
        res.status(500).send(error)
    }
}

const getAllRoom = (req, res) => {
    const { userId } = req.user;
    console.log(userId)
}

const deleteRoom = (req, res) => {

}

module.exports = {
    createRoom, deleteRoom
}