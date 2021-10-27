const { Contracts, User, Room, Services, Renter } = require('../db');

const convertDate = (date) => {
    const today = new Date(date)
    return `${today.getDate()}-${today.getMonth() + 1}-${today.getFullYear()}`
}

const comparisonDate = (date) => {
    const day = new Date(date).getTime()
    const today = new Date().getTime();
    if (day >= today) {
        return true
    }
    return false
    console.log(day > today)
}

const createContracts = async (req, res) => {
    const { userId } = req.user;
    const {
        roomId, startAt, endAt, paymentCycle, price, deposit,
        serviceIds, renterIds
    } = req.body;

    try {
        const contract = await Contracts.create({
            userId, roomId, startAt, endAt, paymentCycle, price, deposit
        })
        await contract.addContractServices(serviceIds);
        await contract.addContractRenter(renterIds)
        res.send(contract)
    } catch (error) {
        console.log(error)
        res.status(500).send(error)
    }
}

const getAllContract = async (req, res) => {
    const { userId } = req.user;

    try {
        const contract = await Contracts.findAll({
            include: [
                {
                    model: User,
                    where: {
                        userId
                    }
                }, {
                    model: Room
                }
            ]
        })
        const takeEffect = [];
        const expired = [];
        const terminateAContract = [];
        contract.forEach(element => {
            var { contractId, startAt, endAt, User: user,
                Room: room,
                status
            } = element.dataValues
            const data = {
                contractId, startAt: convertDate(startAt), endAt: convertDate(endAt),
                userName: user.name,
                roomName: room.name,
                status
            }
            if (status === false) {
                if (!endAt) {
                    takeEffect.push(data)
                }
                else if (comparisonDate(endAt)) {
                    takeEffect.push(data)
                } else {
                    expired.push(data)
                }
            } else {
                terminateAContract.push(data)
            }
        });
        res.send({
            takeEffect: {
                count: takeEffect.length,
                data: takeEffect
            },
            expired: {
                count: expired.length,
                data: expired
            },
            terminateAContract: {
                count: terminateAContract.length,
                data: terminateAContract
            }
        })
    } catch (error) {
        res.status(500).send(error)
    }
}

const getAContract = async (req, res) => {
    const { contractId } = req.params
    try {
        const contract = await Contracts.findAll({
            include: [
                {
                    model: Services,
                    as: 'contractServices'
                }, {
                    model: Renter,
                    as: "contractRenter"
                }, {
                    model: User
                },
                {
                    model: Room
                }
            ],
            where: {
                contractId
            },
            limit: 1
        })
        const {
            startAt,
            endAt,
            price,
            deposit,
            Room: room,
            User: user, paymentCycle,
            contractServices,
            contractRenter
        } = contract[0].dataValues;
        const listService = contractServices.map(el => {
            const { serviceId, name, price, unit, startValue } = el;
            return {
                serviceId, name, price, unit, startValue
            }
        })
        const listRenter = contractRenter.map(el => {
            const { renterId, name, phone } = el
            return {
                renterId, name, phone
            }
        })
        const dataConvert = {
            contractId,
            roomName: room.name,
            startAt: convertDate(startAt),
            endAt: convertDate(endAt),
            userName: user.name,
            price, deposit,
            paymentCycle,
            listService,
            listRenter
        }
        res.send(dataConvert)
    } catch (error) {
        console.log(error)
    }
}

const terminateContract = async (req, res) => {
    const { contractId } = req.params;
    try {
        const result = await Contracts.update({
            status: true
        }, {
            where: {
                contractId
            }
        })
        res.send({
            status: 200,
            message: `terminate complete ${result} contract`
        })
    } catch (error) {
        res.status(500).send(error);
    }
}

const repairContracts = (req, res) => {

}

module.exports = {
    createContracts,
    getAllContract,
    getAContract,
    terminateContract,
    repairContracts
}