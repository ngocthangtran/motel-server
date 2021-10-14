const {
    Room
} = require('../db');

const createRoom = async (req, res) => {
    const {
        buildingId,
        area,
        name,
        deposit,
        price,
        roomTypeId,
        utilityIds
    } = req.body;
    const images = req.images.map(i => {
        return {
            name: i
        }
    });

    try {
        const room = await Room.create({
            buildingId,
            name,
            area,
            deposit,
            price,
            roomTypeId,
            postImages: images
        }, {
            include: ['postImages']
        }
        )
        await room.addUtilities(utilityIds)
        res.send(room)
    } catch (error) {
        res.status(500).send(error)
    }
}

module.exports = {
    createRoom
}