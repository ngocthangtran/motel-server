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
        price
    } = req.body;
    const { userId } = req.user;

    let check;
    try {
        check = await Room.findOne({
            include: {
                model: Building,
                where: {
                    userId
                }
            },
            where: {
                name,
            }
        })
    } catch (error) {
        res.status(500).send(error);
    }

    try {
        if (check !== null) {
            return res.status(400).send({
                stauts: 400,
                message: "Room name already exists"
            })
        }
        const room = await Room.create({
            buildingId,
            name,
            area,
            deposit,
            roomTypeId,
            price
        }
        )
        return res.send(room)
    } catch (error) {
        console.log(error)
        res.status(500).send(error)
    }
}

const getAllRoom = async (req, res) => {
    const { userId } = req.user;
    const { buildingId } = req.query;
    try {
        const room = await Room.findAll({
            attributes: ['roomId', "name", "deposit", "price"],
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
            ],
            order: [['createdAt', 'DESC']],
        });
        const data = room.map(el => {
            const { roomId, Contracts: contract, name, price: pricePhong, deposit } = el;

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
                name,
                contractId: contract.contractId,
                contractCount: contract.length,
                renterCount: renterCount ? renterCount : 0,
                price: price ? price : pricePhong,
                stauts: price ? "Đã thuê" : "Chưa thuê",
                deposit
            }
        })
        res.send(data)
    } catch (error) {
        res.send(error)
    }
}

const getARoom = async (req, res) => {
    const { userId } = req.user;
    const { roomId } = req.params;
    console.log("run in here")
    try {
        const room = await Room.findOne({
            attributes: ['roomId', "name", "deposit", "price"],
            include: [
                {
                    model: Building,
                    attributes: [],
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
            ],
            where: {
                roomId
            }
        });
        const converdata = el => {
            const { roomId, Contracts: contract, name, price: pricePhong, deposit } = el;

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
                name,
                contractId: contract.contractId,
                contractCount: contract.length,
                renterCount: renterCount ? renterCount : 0,
                price: price ? price : pricePhong,
                stauts: price ? "Đã thuê" : "Chưa thuê",
                deposit
            }
        }
        res.send(converdata(room))
    } catch (error) {
        console.log(error)
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

const getRenter = async (req, res) => {
    const { roomId } = req.params;
    try {
        const room = await Room.findOne({
            include: [
                {
                    model: Contracts,
                    include: {
                        model: Renter,
                        as: "contractRenter"
                    },
                    where: {
                        status: false
                    }
                }
            ],
            where: { roomId }
        })
        const contract = room.Contracts[0]
        const renters = contract.contractRenter;
        res.send(renters)
    } catch (error) {
        res.status(500).send(error)
    }
}


module.exports = {
    createRoom, deleteRoom, getAllRoom, getARoom, getRenter
}