const { Op } = require('sequelize');
const { Contracts, User, Room, Building, Province, Ward, District, Services,
    FeeBaseOn, Bills_services, sequelize
} = require('../db');

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
}

const getContractTakeEffect = async (req, res) => {
    const { userId } = req.user;
    try {
        const contract = await Contracts.findAll({
            include: [
                {
                    model: User,
                    attributes: ['userId'],
                    where: {
                        userId
                    }
                }, {
                    model: Room,
                    include: {
                        model: Building,
                        include: {
                            model: Ward,
                            include: {
                                model: District,
                                include: Province
                            }
                        }
                    }
                }
            ],
        })

        const data = contract.reduce((beforeValue, afterValue, index) => {
            var {
                Room: room,
            } = afterValue.dataValues
            const { Building, name: nameRoom, roomId } = room;
            const { buildingId, name, address } = Building;
            if (!beforeValue.find(value => value.buildingId === buildingId)) {
                beforeValue.push({
                    buildingId: buildingId,
                    name: name,
                    room: [
                        {
                            roomId,
                            name: nameRoom,
                            address,
                            ward: Building.Ward.name,
                            District: Building.Ward.District.name,
                            Province: Building.Ward.District.Province.name,
                        }
                    ]
                })
            } else {
                const indexBulding = beforeValue.findIndex(value => value.buildingId === buildingId)

                beforeValue[indexBulding].room.push({
                    roomId,
                    name: nameRoom,
                    address,
                    ward: Building.Ward.name,
                    District: Building.Ward.District.name,
                    Province: Building.Ward.District.Province.name,
                })
            }
            return beforeValue
        }, [])
        res.send(data)
    } catch (error) {
        console.log(error)
        res.status(500).send(error)
    }
}

const serviceOfRoom = async (req, res) => {
    const { roomId, month, year } = req.query
    try {
        const service = await Contracts.findOne({
            include: [
                {
                    model: Room,
                    attributes: ['name']
                },
                {
                    model: Services,
                    as: "contractServices",
                    include: {
                        model: FeeBaseOn,
                        as: "createFeeBasseOn"
                    },
                    attributes: ["name", "serviceId", "price", "unit", "startValue"]
                },
            ],
            where: {
                roomId,
            },
        })

        var bill_service = await Bills_services.findAll({
            where: {
                [Op.and]: [
                    sequelize.where(sequelize.fn("MONTH", sequelize.col('date')), month),
                    sequelize.where(sequelize.fn("YEAR", sequelize.col('date')), year),
                    { contractId: service.contractId },
                ],
            },
            group: ['serviceId'],
        })
        var maxDate = await Bills_services.findOne({
            attributes: [[sequelize.fn('max', sequelize.col('date')), 'max']],
            where: {
                contractId: service.contractId
            },
            group: ['serviceId'],
        })
        if (bill_service.length === 0 && maxDate) {
            maxDate = maxDate.dataValues.max
            bill_service = await Bills_services.findAll({
                where: {
                    [Op.and]: [
                        { date: maxDate },
                        { contractId: service.contractId },
                    ],
                },
                group: ['serviceId'],
            })
        }
        const convert = (dataService, dataBill) => {
            const {
                Room: room, contractServices, contractId
            } = dataService
            const service = contractServices.map(el => {
                const { name, serviceId, price, unit, startValue } = el;
                const a = dataBill.findIndex(el => el.serviceId === serviceId)
                if (a === -1) {
                    return { name, serviceId, price, unit, lastValue: startValue }
                }
                return { name, serviceId, price, unit, lastValue: dataBill[a].currentValue }
            })

            const data = {
                contractId,
                roomName: room.name,
                service
            }
            return data
        }
        res.send(convert(service, bill_service))

    } catch (error) {
        console.log(error)
        res.status(500).send(error)
    }
}

const singleClosing = async (req, res) => {
    const { date, contractId, services } = req.body;
    const listService = services.map(el => {
        return {
            ...el,
            date, contractId
        }
    })
    try {
        const newDate = new Date(date);
        const checkBillExistsMonth = await Bills_services.findOne({
            where: {
                [Op.and]: [
                    sequelize.where(sequelize.fn("MONTH", sequelize.col('date')), newDate.getMonth() + 1),
                    sequelize.where(sequelize.fn("YEAR", sequelize.col('date')), newDate.getFullYear()),
                    { contractId: contractId },
                ],
            }
        })
        const getFirstMonthForContract = await Bills_services.findOne({
            attributes: [[sequelize.fn('max', sequelize.col('date')), 'max']],
            where: {
                contractId
            }
        })

        const oldDate = new Date(getFirstMonthForContract.dataValues.max)



        if (!checkBillExistsMonth) {
            if (newDate.getTime() < oldDate.getTime()) {
                return res.status(400).send({
                    status: 400,
                    message: "service has been closed"
                })
            }
            const results = await Bills_services.bulkCreate(listService);
            return res.send(results)
        }
        return res.status(400).send({
            status: 400,
            message: "This month's service has been closed"
        })
    } catch (error) {
        console.log(error)
        res.status(500).send({
            status: 500,
            message: "error"
        })
    }
}

module.exports = {
    getContractTakeEffect, singleClosing,
    serviceOfRoom
}