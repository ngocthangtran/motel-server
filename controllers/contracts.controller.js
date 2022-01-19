const e = require('express');
const { Contracts, User, Room, Services, Renter, sequelize, ContractService, Building } = require('../db');

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
    let checkRoom
    try {
        checkRoom = await Contracts.findOne({
            where: {
                roomId,
                status: false,
                userId
            }
        })
    } catch (error) {
        res.status(500).status({
            status: 500,
            message: "an error occurred in checkRoomService"
        })
    }
    if (!checkRoom) {
        try {
            const contract = await Contracts.create({
                userId,
                roomId,
                startAt,
                endAt,
                paymentCycle,
                price,
                deposit
            })
            const contractService = serviceIds.map(el => {
                const { contractId } = contract.dataValues;
                el.contractId = contractId
                return el;
            })

            await ContractService.bulkCreate(
                contractService
            )

            await contract.addContractRenter(renterIds)
            return res.send(contract)
        } catch (error) {
            console.log(error)
            res.status(500).send(error)
        }
    } else {
        return res.status(406).send({
            message: "The room has a contract"
        })
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
                    model: Room,
                    include: Building
                }
            ],
            order: [['createdAt', 'DESC']],
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
                contractId,
                nameBuilding: room.Building.name,
                startAt: convertDate(startAt), endAt: convertDate(endAt),
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
        res.send(
            {
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
            }
        )
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
                    model: ContractService,
                    as: 'contractServices',
                    include: {
                        model: Services
                    }
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
            const { serviceId, startValue } = el;
            const { name, price, unit, icon } = el.dataValues.Service
            return {
                serviceId, name, price, unit, icon, startValue
            }
        })
        const listRenter = contractRenter.map(el => {
            const { renterId, name, phone } = el.dataValues
            return {
                renterId, name, phone
            }
        })
        const dataConvert = {
            contractId,
            roomId: room.roomId,
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

const repairContracts = async (req, res) => {
    const { contractId } = req.params;
    const {
        startAt, endAt, paymentCycle, price, deposit,
        serviceIds, renterIds
    } = req.body;

    try {
        const result = await Contracts.update({
            startAt, endAt, paymentCycle, price, deposit
        }, {
            where: {
                contractId
            }
        })
        const contract = await Contracts.findByPk(contractId)
        // find service exits on contract
        const serviceInContract = await ContractService.findAll({
            attributes: ['serviceId'],
            where: {
                contractId
            }
        })

        serviceIds.forEach((el, index) => {
            serviceInContract.forEach(element => {
                if (el.serviceId === element.serviceId) {
                    serviceIds.splice(index, 1)
                }

            })

        })

        const contractService = serviceIds.map(el => {
            el.contractId = contractId
            return el;
        })

        await ContractService.bulkCreate(
            contractService
        )
        await contract.addContractRenter(renterIds)
        res.send({
            status: 200,
            message: `${result} contract is changed`
        })
    } catch (error) {
        console.log(error)
    }
}

const removeServiceRenter = async (req, res) => {
    const { serviceId, renterId } = req.body
    const { contractId } = req.params;
    try {
        let sql;
        sql = `delete from motel.contract_renter where renterId="${renterId}" and contractId="${contractId}"`
        if (serviceId) {
            sql = `delete from motel.contracts_services where serviceId="${serviceId}" and contractId="${contractId}"`
        }
        const result = await sequelize.query(sql);
        res.send({
            status: 200,
            message: "remove complete"
        })
    } catch (error) {
        res.status(500).send({
            status: 500,
            message: "Loi"
        })
    }
}

const deleteContract = async (req, res) => {
    const { contractId } = req.params;
    try {
        const contract = await Contracts.findOne({
            include: [
                "contractServices", "contractRenter"
            ],
            where: {
                contractId
            }
        })
        contract.destroy();
        res.send({
            message: `delete complete with contractId: ${contractId}`
        })
    } catch (error) {
        console.log(error)
        res.status(500).send({
            status: 500,
            message: "error"
        })
    }
}

const addRenterContract = async (req, res) => {
    const { renterIds, contractId } = req.body;
    try {
        const contract = await Contracts.findByPk(contractId);
        await contract.addContractRenter(renterIds)
        res.send(contract)
    } catch (error) {
        console.log(error)
        res.status(500).send(error)
    }
}

module.exports = {
    createContracts,
    getAllContract,
    getAContract,
    terminateContract,
    repairContracts,
    removeServiceRenter,
    deleteContract,
    addRenterContract
}