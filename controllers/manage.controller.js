const { Op } = require('sequelize');
const { Contracts, User, Room, Building, Province, Ward, District, Services,
    FeeBaseOn, Bills_services, sequelize, ContractService, Bill, Renter
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
    const { month, year } = req.query;

    try {
        // lay danh sach hop dong da chot dich vu
        const contractServieExitMonth = await Contracts.findAll({
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
                },
                {
                    model: Bills_services,
                    where: {
                        [Op.and]: [
                            sequelize.where(sequelize.fn("MONTH", sequelize.col('date')), month),
                            sequelize.where(sequelize.fn("YEAR", sequelize.col('date')), year)
                        ],
                    }
                }
            ],
            where: {
                status: false
            }
        })
        const contract = await Contracts.findAll({
            include: [
                {
                    model: User,
                    attributes: ['userId'],
                    where: {
                        userId
                    }
                },
                {
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
            where: {
                status: false
            }
        })


        // lay data da co trong thang
        const allRoomIdExit = [];
        const exitmonth = contractServieExitMonth.reduce((beforeValue, afterValue) => {
            var {
                contractId,
                Room: room,
            } = afterValue.dataValues
            const { Building, name: nameRoom, roomId } = room;
            const { buildingId, name, address } = Building;
            allRoomIdExit.push(roomId);
            if (!beforeValue.find(value => value.buildingId === buildingId)) {
                beforeValue.push({
                    buildingId: buildingId,
                    name: name,
                    room: [
                        {
                            contractId,
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
        if (allRoomIdExit.length !== 0) {
            allRoomIdExit.forEach(el => {
                console.log(el)
                const index = contract.findIndex(ele => ele.roomId === el);
                contract.splice(index, 1)
            })
        }
        var notExitMonth = contract.reduce((beforeValue, afterValue) => {
            var {
                contractId,
                Room: room,
            } = afterValue.dataValues
            const { Building, name: nameRoom, roomId } = room;
            const { buildingId, name, address } = Building;
            allRoomIdExit.push(roomId);
            if (!beforeValue.find(value => value.buildingId === buildingId)) {
                beforeValue.push({
                    buildingId: buildingId,
                    name: name,
                    room: [
                        {
                            contractId,
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
        res.send({
            "exitmonth": exitmonth,
            "notExitMonth": notExitMonth
        })
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
                        attributes: ["name", "serviceId", "price", "unit", "icon"]
                    }
                },
            ],
            where: {
                roomId, status: false
            },
        })

        var bill_service = await Bills_services.findAll({
            where: {
                [Op.and]: [
                    sequelize.where(sequelize.fn("MONTH", sequelize.col('date')), month),
                    sequelize.where(sequelize.fn("YEAR", sequelize.col('date')), year),
                    { contractId: service.contractId },
                ],
            }
        })



        var maxDate = await Bills_services.findOne({
            attributes: [[sequelize.fn('max', sequelize.col('date')), 'max']],
            where: {
                contractId: service.contractId
            },
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
            })
        }
        const convert = (dataService, dataBill) => {
            const {
                Room: room, contractServices, contractId
            } = dataService
            const service = []

            contractServices.forEach(el => {
                const { serviceId, startValue } = el.dataValues;
                const { name, price, unit, createFeeBasseOn, icon } = el.dataValues.Service
                console.log(icon)
                const check = listSingleClosingFeeBaseOn.find(el => {
                    return el === createFeeBasseOn.fee_base_on_id
                })
                if (check) {
                    const a = dataBill.findIndex(el => el.serviceId === serviceId)
                    if (a === -1) {
                        return service.push({ name, serviceId, price, unit, icon, lastValue: startValue })
                    }
                    return service.push({ name, serviceId, price, unit, icon, lastValue: dataBill[a].currentValue })
                }

            })

            const data = {
                contractId,
                roomName: room.name,
                service
            }
            return data
        }
        // res.send(service)
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

    let contract, billForContract, rent, diffDays, startDay, endDay;

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
        billForContract = await Bill.findOne({
            where: {
                [Op.and]: [
                    sequelize.literal(`createdAt=(select min(createdAt) from motel.bill)`),
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
        startDay = date1; endDay = date2
        const diffTime = Math.abs(date2 - date1)
        diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

        rent = Math.round((parseInt(contract.price) / lastDay) * diffDays)
    }
    else {
        const lastDay = new Date(arrDate[0], arrDate[1], 0).getDate()
        let date1 = new Date(contract.startAt);
        if (billForContract) {
            date1 = new Date(`${arrDate[0]}-${arrDate[1]}-1`);
        }
        const date2 = new Date(`${arrDate[0]}-${arrDate[1]}-${lastDay}`);
        startDay = `${date1.getFullYear()}-${date1.getMonth() + 1}-${date1.getDate()}`;
        endDay = `${date2.getFullYear()}-${date2.getMonth() + 1}-${date2.getDate()}`;
        const diffTime = Math.abs(date2 - date1)
        diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        rent = Math.round((parseInt(contract.price) / lastDay) * diffDays)
    }
    // tinhs tieenf
    var renterCount = 1;
    try {
        const service = await Contracts.findOne({
            include: [

                {
                    model: Room,
                    attributes: ['name']
                },
                {
                    model: Renter,
                    as: "contractRenter"
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
                        attributes: ["name", "serviceId", "price", "unit", "icon"]
                    }
                },
            ],
            where: {
                roomId,
            },
        })

        if (service.contractRenter.length > 0) {
            renterCount = service.contractRenter.length;
        }

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
                const { name, price, unit, icon, createFeeBasseOn } = el.dataValues.Service
                const fee_base_on_id = createFeeBasseOn.fee_base_on_id;
                const a = dataBill[0].findIndex(el => {
                    return el.serviceId === serviceId
                })
                if (a === -1) {
                    return service.push({ name, serviceId, icon, feeBaseOnId: fee_base_on_id, price, unit, lastValue: startValue, currentValue: null, intoMoney: null })
                }
                if (fee_base_on_id === "6c368419-c07c-4b72-b8a0-a2b5c96ee030") {
                    return service.push({ serviceId, icon, feeBaseOnId: fee_base_on_id, billServiceId: dataBill[0][a].billServiceId, name, price, unit, lastValue: dataBill[0][a].lastValue, currentValue: dataBill[0][a].currentValue, intoMoney: dataBill[0][a].price * renterCount })
                }
                return service.push({ serviceId, icon, feeBaseOnId: fee_base_on_id, billServiceId: dataBill[0][a].billServiceId, name, price, unit, lastValue: dataBill[0][a].lastValue, currentValue: dataBill[0][a].currentValue, intoMoney: dataBill[0][a].price })

            })

            return service
        }

        res.send({
            startDay,
            endDay,
            rent,
            diffDays,
            renterCount,
            contractId: contract.contractId,
            service: convert(service, bill_service)
        })

    } catch (error) {
        console.log(error)
        res.status(500).send(error)
    }
}

const createBill = async (req, res) => {
    const {
        date, contractId, service, rent, startDay, endDay
    } = req.body;

    let checkBillExistsMonth;

    try {
        const newDate = new Date(date);
        checkBillExistsMonth = await Bill.findOne({
            where: {
                [Op.and]: [
                    sequelize.where(sequelize.fn("MONTH", sequelize.col('date')), newDate.getMonth() + 1),
                    sequelize.where(sequelize.fn("YEAR", sequelize.col('date')), newDate.getFullYear()),
                    { contractId: contractId },
                ],
            }
        })
    } catch (error) {
        console.log(error)
        return res.status(500).send({
            message: "Error on check bill exits month"
        })
    }
    if (!checkBillExistsMonth) {
        var serviceNotCreate = [];
        const listBillServiceId = [];
        var sumPrice = rent;

        service.forEach(el => {
            if (!el.billServiceId) {
                sumPrice += parseInt(el.price);
                //check the exitstence of bill service
                serviceNotCreate.push(el);
            } else {
                sumPrice += parseInt(el.intoMoney);
                listBillServiceId.push(el.billServiceId)
            }
        })
        serviceNotCreate = serviceNotCreate.map(el => {
            el.contractId = contractId;
            el.date = date
            return el;
        })

        if (serviceNotCreate.length !== 0) {
            try {
                const billService = await Bills_services.bulkCreate(serviceNotCreate);
                billService.forEach(el => {
                    listBillServiceId.push(el.billServiceId)
                })
            } catch (error) {
                console.log(error)
            }
        }
        try {
            const bill = await Bill.create({
                contractId,
                date,
                sumPrice, status: false,
                startDay, endDay
            })
            await bill.addBillService(listBillServiceId);
            res.send(bill)
        } catch (error) {
            res.status(500).send({
                status: 500,
                message: error
            })
        }
    } else {
        res.status(406).send({
            status: 406,
            message: "Bill on the month already exits"
        })
    }

}

const getAllBillonMonth = async (req, res) => {
    const { userId } = req.user
    const { month, year } = req.query;

    try {
        const bill = await Bill.findAll({
            include: [
                {
                    model: Contracts,
                    include: [
                        {
                            model: Room,
                            include: Building
                        }
                    ],
                    where: {
                        userId
                    }
                }
            ],
            where: {
                [Op.and]: [
                    sequelize.where(sequelize.fn("MONTH", sequelize.col('date')), month),
                    sequelize.where(sequelize.fn("YEAR", sequelize.col('date')), year)
                ]
            }
        });
        const data = {
            paid: [],
            unPaid: []
        }
        bill.forEach(vl => {
            const { billId, sumPrice, Contract, status } = vl;
            const roomName = Contract.Room.name, buildingName = Contract.Room.Building.name
            if (status === false) {
                data.unPaid.push({ billId, sumPrice, roomName, buildingName })
            } else {
                data.Paid.push({ billId, sumPrice, roomName, buildingName })
            }
        })

        res.send(data)
    } catch (error) {
        console.log(error)
    }
}

const billDetails = async (req, res) => {
    const { billId } = req.params;
    try {
        const bill = await Bill.findOne({
            include: [
                {
                    model: Contracts,
                    include: {
                        model: Room,
                        include: Building
                    }

                },
                {
                    model: Bills_services,
                    as: "billService",
                    include: {
                        model: Services,

                    }
                },
            ],
            where: {
                billId
            }
        })
        const data = {
            billId,
            status: bill.status,
            nameBuilding: bill.Contract.Room.Building.name,
            nameRoom: bill.Contract.Room.name,
            startDay: bill.startDay,
            endDay: bill.endDay
        }
        const services = bill.billService.map(el => {
            // { name, serviceId, price, unit, lastValue: startValue, currentValue: null, intoMoney: null }
            const {
                lastValue, currentValue, quantily, price, Service: service
            } = el;
            const { name: nameService, unit, icon } = service

            return {
                lastValue, currentValue, quantily, price, nameService, unit, icon,
                intoMoney: lastValue ? (currentValue - lastValue) * parseInt(price) : parseInt(price)
            }
        })
        res.send({ ...data, services })
    } catch (error) {
        console.log(error)
    }
}

const deleteClosing = async (req, res) => {
    console.log('run here')
    const { date, contractId } = req.query;
    let checkBill;
    const dateType = new Date(date)

    const month = dateType.getMonth() + 1,
        year = dateType.getFullYear()
    try {
        checkBill = await Contracts.findOne({
            include: [
                {
                    model: Bill,
                    where: {
                        [Op.and]: [
                            sequelize.where(sequelize.fn("MONTH", sequelize.col('date')), month),
                            sequelize.where(sequelize.fn("YEAR", sequelize.col('date')), year)
                        ]
                    }
                }
            ],
            where: {
                contractId
            }
        })
    } catch (error) {
        res.status(500).send({
            message: "err at check bull",
            error
        })
    }
    if (checkBill) return res.status(400).send({
        message: `Không thể xóa chốt dịch vụ trong tháng ${month} vì đã tồn tại hóa đơn!`
    })
    try {

        const contract = await Contracts.findOne({
            include: [
                {
                    model: Bills_services,
                    where: {
                        [Op.and]: [
                            sequelize.where(sequelize.fn("MONTH", sequelize.col('date')), month),
                            sequelize.where(sequelize.fn("YEAR", sequelize.col('date')), year)
                        ]
                    }
                }
            ],
            where: {
                contractId
            }
        })
        if (!contract) return res.status(404).send({ message: "Không tìm thấy dịch vụ được chốt của phòng này!" })
        const listBillService = contract.Bills_services.map(el => {
            return el.billServiceId
        })
        await Bills_services.destroy(
            {
                where: {
                    billServiceId: listBillService
                }
            }
        )
        return res.send({
            message: `Đã xóa chốt dịch vụ của tháng ${month} năm ${year}`
        })
    } catch (error) {
        console.log(error)
        res.status(500).send(error);
    }
}

const notExitBill = async (req, res) => {
    const { date } = req.query;
    const dateType = new Date(date);
    const month = dateType.getMonth() + 1, year = dateType.getFullYear();
    try {
        const exitBill = await Contracts.findAll({
            include: [
                {
                    model: User,
                    where: {
                        userId: req.user.userId
                    }
                },
                {
                    model: Bill,
                    where: {
                        [Op.and]: [
                            sequelize.where(sequelize.fn("MONTH", sequelize.col('date')), month),
                            sequelize.where(sequelize.fn("YEAR", sequelize.col('date')), year)
                        ]
                    }
                }, {
                    model: Room,
                    include: {
                        model: Building
                    }
                }
            ], where: {
                status: false
            }
        })
        const listExit = [];
        const exitmonth = exitBill.reduce((beforeValue, afterValue) => {
            var {
                contractId,
                Room: room,
            } = afterValue.dataValues
            const { Building, name: nameRoom, roomId } = room;
            const { buildingId, name, address } = Building;
            listExit.push(roomId);
            if (!beforeValue.find(value => value.buildingId === buildingId)) {
                beforeValue.push({
                    buildingId: buildingId,
                    name: name,
                    room: [
                        {
                            contractId,
                            roomId,
                            name: nameRoom,
                            address
                        }
                    ]
                })
            } else {
                const indexBulding = beforeValue.findIndex(value => value.buildingId === buildingId)
                beforeValue[indexBulding].room.push({
                    roomId,
                    name: nameRoom,
                    address
                })
            }
            return beforeValue
        }, [])
        const notExitBill = await Contracts.findAll({
            include: [
                {
                    model: User,
                    where: {
                        userId: req.user.userId
                    }
                },
                {
                    model: Bill,
                }, {
                    model: Room,
                    include: {
                        model: Building
                    }
                }
            ], where: {
                status: false
            }
        })

        if (listExit.length !== 0) {
            listExit.forEach(el => {
                const index = notExitBill.findIndex(ele => ele.roomId === el);
                notExitBill.splice(index, 1)
            })
        }

        const notExitmonth = notExitBill.reduce((beforeValue, afterValue) => {
            var {
                contractId,
                Room: room,
            } = afterValue.dataValues
            const { Building, name: nameRoom, roomId } = room;
            const { buildingId, name, address } = Building;
            listExit.push(roomId);
            if (!beforeValue.find(value => value.buildingId === buildingId)) {
                beforeValue.push({
                    buildingId: buildingId,
                    name: name,
                    room: [
                        {
                            contractId,
                            roomId,
                            name: nameRoom,
                            address
                        }
                    ]
                })
            } else {
                const indexBulding = beforeValue.findIndex(value => value.buildingId === buildingId)
                beforeValue[indexBulding].room.push({
                    roomId,
                    name: nameRoom,
                    address
                })
            }
            return beforeValue
        }, [])
        res.send({
            exitBill: exitmonth,
            notExitBill: notExitmonth
        })
    } catch (error) {
        console.log(error)
    }
}

const payBill = (req, res) => {

}

module.exports = {
    getContractTakeEffect, singleClosing,
    serviceOfRoom,
    createBill, billservice, getAllBillonMonth,
    billDetails, deleteClosing, notExitBill
}