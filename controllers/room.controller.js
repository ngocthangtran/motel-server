const {
    Room, Building, User, Contracts, Renter, sequelize
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

const getAllRoom = async (req, res) => {
    const { userId } = req.user;
    const { buildingId } = req.query;
    try {
        const room = await Room.findAll({
            attributes: ['roomId'],
            include: [
                {
                    model: Building,
                    attributes: [],
                    where: {
                        buildingId
                    },
                    include: {
                        model: User,
                        attributes: [],
                        where: {
                            userId
                        }
                    }
                },
                {
                    model: Contracts,
                    include: {
                        model: Renter,
                        as: 'contractRenter',
                    }
                }
            ]
        });
        const data = room.map(el => {
            const { roomId, Contracts: contract } = el;
            let price, renterCount;

            if (contract && contract.length > 0) {

                contract.forEach(element => {
                    if (element.status === false) {
                        price = element.price
                        renterCount = element.contractRenter.length

                    }
                });
            }
            return {
                roomId,
                contractId: contract.contractId,
                contractCount: contract.length,
                renterCount: renterCount ? renterCount : 0,
                price: price ? price : "Chưa định giá",
                stauts: price ? "Đã thuê" : "Chưa thuê"
            }
        })
        res.send(data)
    } catch (error) {
        res.send(error)
    }
}

const deleteRoom = async (req, res) => {
    const { userId } = req.user;
    const { roomId, buildingId } = req.query;
    //check contract Room
    let countContract;
    try {
        const roomContract = await Contracts.findOne({
            attributes: [
                [sequelize.fn("COUNT", sequelize.col("contractId")), "count"]
            ],
            where: {
                roomId, userId
            }
        })
        countContract = roomContract.dataValues.count;
        if (countContract > 0) {
            return res.status(400).send({
                message: `This room has ${countContract} contracts`
            })
        }
    } catch (error) {
        res.status(500).send({
            message: "error check contract room",
            error
        })
    }

    try {
        await Room.destroy({
            where: {
                roomId, buildingId
            }
        })
        return res.send({
            message: "deleted a line"
        })
    } catch (error) {
        res.status(500).send({
            message: "error delete contract room",
            error
        })
    }
}

module.exports = {
    createRoom, deleteRoom, getAllRoom
}