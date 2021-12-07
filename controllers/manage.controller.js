const { Op } = require('sequelize');
const { Contracts, User, Room, Building, Province, Ward, District, Services,
    FeeBaseOn, Bills_services, sequelize, ContractService, Bill
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
    const listSingleClosingFeeBaseOn = ["891e1461-27db-46df-a7b6-442fdfeaef98", "8b0871c8-5f03-4507-997f-c2008e67937d", "e733f1d3-0032-4e41-9043-2f91a4e10880"]
    const { roomId, month, year } = req.query
    try {
        const service = await Contracts.findOne({
            include: [
                {
                    model: Room,
                    attributes: ['name']
                },
                {
                    model: ContractService,
                    as: "contractServices",
                    include: {
                        model: Services,
                        include: {
                            model: FeeBaseOn,
                            as: "createFeeBasseOn"
                        },
                        attributes: ["name", "serviceId", "price", "unit"]
                    }
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
            const service = []

            contractServices.forEach(el => {
                const { serviceId, startValue } = el.dataValues;
                const { name, price, unit, createFeeBasseOn } = el.dataValues.Service
                const check = listSingleClosingFeeBaseOn.find(el => {
                    return el === createFeeBasseOn.fee_base_on_id
                })
                if (check) {
                    const a = dataBill.findIndex(el => el.serviceId === serviceId)
                    if (a === -1) {
                        return service.push({ name, serviceId, price, unit, lastValue: startValue })
                    }
                    return service.push({ name, serviceId, price, unit, lastValue: dataBill[a].currentValue })
                }

            })

            const data = {
                contractId,
                roomName: room.name,
                service
            }
            return data
        }
        // res.send(bill_service)
        res.send(convert(service, bill_service))

    } catch (error) {
        console.log(error)
        res.status(500).send(error)
    }
}

const singleClosing = async (req, res) => {
    const { date, contractId, services } = req.body;
    const listService = services.map(el => {
        const { quantily, lastValue, currentValue, priceService } = el;
        let price;
        if (!quantily) {
            if (lastValue && currentValue) {
                if (lastValue > currentValue)
                    return res.status(400).send({
                        status: 400,
                        message: "last value must be more memorable than currenvalue "
                    })
                price = (currentValue - lastValue) * priceService
            } else return res.status(400).send({
                status: 400,
                message: "lastValue and currentValue is require"
            })

        } else {
            price = quantily * priceService
        }
        return {
            ...el,
            date, contractId, price
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



const billservice = async (req, res) => {
    const { userId } = req.user
    const {
        month, roomId, endAt, startAt
    } = req.query

    let contract, billForContract, rent, diffDays;

    try {
        contract = await Contracts.findOne({
            where: {
                roomId, userId, status: false
            }
        })
    } catch (error) {
        console.log(error)
        res.status(500).send({
            message: "get contract err",
            error
        })
    }
    try {
        billForContract = await Contracts.findOne({
            where: {
                [Op.and]: [
                    sequelize.literal(`createdAt=(select min(createdAt) from motel.contracts)`),
                    { contractId: contract.contractId }
                ]
            }
        })
    } catch (error) {
        res.status(500).send({
            message: "get bill err",
            error
        })
    }
    const arrDate = month.split('-')
    if (endAt && startAt) {
        const date1 = new Date(startAt);
        const date2 = new Date(endAt);

        const diffTime = Math.abs(date2 - date1)
        diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

        rent = Math.round((parseInt(contract.price) / lastDay) * diffDays)
    }
    else {

        const lastDay = new Date(arrDate[0], arrDate[1], 0).getDate()
        let date1 = new Date(arrDate[0], arrDate[1], 1);
        if (!billForContract) {
            date1 = new Date(contract.startAt);
        }
        const date2 = new Date(`${arrDate[0]}-${arrDate[1]}-${lastDay}`);

        const diffTime = Math.abs(date2 - date1)
        diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

        rent = Math.round((parseInt(contract.price) / lastDay) * diffDays)
    }

    try {
        const service = await Contracts.findOne({
            include: [
                {
                    model: Room,
                    attributes: ['name']
                },
                {
                    model: ContractService,
                    as: "contractServices",
                    include: {
                        model: Services,
                        include: {
                            model: FeeBaseOn,
                            as: "createFeeBasseOn"
                        },
                        attributes: ["name", "serviceId", "price", "unit"]
                    }
                },
            ],
            where: {
                roomId,
            },
        })

        var bill_service = await sequelize.query(`select *
         from motel.bills_services 
         where 
         month(date)=${arrDate[1]} and year(date)=${arrDate[0]} and contractId="${contract.contractId}"`)


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
                        { contractId: contract.contractId },
                    ],
                },
                group: ['serviceId'],
            })
        }
        const convert = (dataService, dataBill) => {
            const {
                Room: room, contractServices, contractId
            } = dataService
            const service = []

            contractServices.forEach(el => {
                const { serviceId, startValue } = el.dataValues;
                const { name, price, unit } = el.dataValues.Service
                const a = dataBill[0].findIndex(el => {
                    return el.serviceId === serviceId
                })
                if (a === -1) {
                    return service.push({ name, serviceId, price, unit, lastValue: startValue, currentValue: null })
                }
                return service.push({ name, serviceId, price, unit, lastValue: dataBill[0][a].lastValue, currentValue: dataBill[0][a].currentValue })

            })

            return service
        }
        // res.send(bill_service)
        res.send({
            rent,
            diffDays,
            service: convert(service, bill_service)
        })

    } catch (error) {
        console.log(error)
        res.status(500).send(error)
    }
}

const createBill = (req, res) => {

}

module.exports = {
    getContractTakeEffect, singleClosing,
    serviceOfRoom,
    createBill, billservice
}