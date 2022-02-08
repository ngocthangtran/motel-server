const e = require('cors');
const { Building, Ward, District, Province, Services, sequelize, Room } = require('../db');

const createBuilding = async (req, res) => {
    const {
        name,
        address,
        openTime,
        closeTime,
        wardId,
        serviceIds
    } = req.body;

    const checkNameBuilding = await Building.findOne({
        where: {
            name, userId: req.user.userId
        }
    })
    if (checkNameBuilding) {
        return res.status(400).send({
            message: "the building already exists"
        })
    }
    const building = await Building.create({
        userId: req.user.userId,
        name,
        address,
        openTime,
        closeTime,
        wardId
    })
    if (serviceIds && serviceIds.length !== 0) {
        await building.addBuildingService(serviceIds)
    }
    res.status(200).send({ building })
}

const getBuilding = async (req, res) => {
    const { userId } = req.user;
    try {
        const listBuilding = await Building.findAll(
            {
                attributes: ['buildingId', 'name', "address"],
                where: {
                    userId
                },
                include: [{
                    model: Ward,
                    attributes: ['name', 'wardId'],
                    include: {
                        model: District,
                        attributes: ['name'],
                        include: {
                            model: Province,
                            attributes: ['name'],
                        }
                    }
                }],
                order: [['createdAt', 'DESC']],
            }
        )

        const converData = listBuilding.map(item => {
            const building = item.dataValues;
            const { Ward: ward } = building;
            const { District: district } = ward
            const { Province: province } = district
            const address = `${building.address}, ${ward.name}, ${district.name}, ${province.name}`
            return {
                buildingId: building.buildingId,
                name: building.name,
                address,
                wardId: ward.wardId
            }
        })
        res.send(converData)
    } catch (error) {
        res.status(500).send(error)
    }
}

const deleteBulding = async (req, res) => {
    const { userId } = req.user;
    const { buildingId } = req.params;
    // check room
    try {
        const building = await Building.findOne({
            include: [
                {
                    model: Room
                }
            ],
            where: {
                userId,
                buildingId
            }
        })

        if (building.Rooms.length === 0) {
            try {
                const result = await Building.destroy({
                    where: {
                        userId,
                        buildingId
                    }
                })
                return res.send({
                    message: `deleted ${result} line`
                })
            } catch (error) {
                res.status(500).send(error)
            }
        } else {
            return res.status(400).send({
                message: `Tòa nhà tồn tại phòng và có hợp đồng không thể xóa`
            })
        }
    } catch (error) {
        console.log(error)
        res.status(500).send({ message: "error" })
    }
}

const repairBuilding = async (req, res) => {
    const { userId } = req.user;
    const {
        buildingId,
        name,
        address,
        serviceIds
    } = req.body;
    console.log(req.body)

    let removeServiceIds, addServiceIds
    //processed service add - removve
    try {
        if (!serviceIds || serviceIds.length === 0) return res.status(404).send({ message: "serviceIds is require" })
        var services = await Building.findOne({
            include: [
                {

                    model: Services,
                    as: 'buildingService',
                }
            ],
            where: {
                buildingId
            }
        });

        services = services.buildingService.map(el => {
            return el.serviceId
        })
        const fiter = (arr1True, arr2False) => {
            const arr = []
            arr1True.forEach((el) => {
                const a = arr2False.find(item => item === el);
                if (a === undefined)
                    arr.push(el)
            })
            return arr
        }

        removeServiceIds = fiter(services, serviceIds);
        addServiceIds = fiter(serviceIds, services)
    } catch (error) {
        console.log(error)
    }

    //prosessed change data on database
    try {
        await Building.update(
            {
                name, address
            },
            {
                where: {
                    userId,
                    buildingId
                }
            }
        )
        if (addServiceIds) {
            addServiceIds.forEach(async el => {
                try {
                    const service = await Services.findByPk(el)
                    await service.addServiceBuilding(buildingId)
                } catch (error) {
                    return res.status(500).send({
                        message: "error add service on repair"
                    })
                }
            })
        }
        if (removeServiceIds) {
            removeServiceIds.forEach(async el => {
                try {
                    const sql = `delete from motel.services_building where serviceId="${el}" and buildingId="${buildingId}"`
                    await sequelize.query(sql)
                } catch (error) {
                    console.log(error)
                }
            })
        }
        return res.send({
            message: "complete"
        })
    } catch (error) {
        return res.status(500).send(error)
    }
}

const addService = async (req, res) => {
    const { serviceId, buildingId } = req.body;
    try {
        const service = await Services.findByPk(serviceId)
        await service.addServiceBuilding(buildingId)
        res.send({
            message: "Ok",
            data: service
        });
    } catch (error) {
        res.status(500).send(error)
    }
}

const removeService = async (req, res) => {

    const { serviceId, buildingId } = req.body;
    try {
        const sql = `delete from motel.servicesbuilding where serviceId="${serviceId}" and buildingId="${buildingId}"`
        const result = await sequelize.query(sql)
        res.send(result)
    } catch (error) {
        res.status(500).send(error)
    }
}

const getABuilding = async (req, res) => {
    const { buildingId } = req.params;
    const userId = req.user.userId;
    try {
        const building = await Building.findOne({
            include: [
                {
                    model: Room
                }, {
                    model: Services,
                    as: 'buildingService'
                },
                {
                    model: Ward,
                    include: {
                        model: District,
                        include: Province
                    }
                }
            ],
            where: {
                buildingId, userId
            }
        });
        const { Room: room, buildingService, Ward: ward } = building;
        res.send({
            buildingId,
            name: building.name,
            address: `${building.address}, ${ward.name}, ${ward.District.name}, ${ward.District.Province.name}`,
            roomCount: room ? room.length : 0,
            service: buildingService
        })
    } catch (error) {
        console.log(error)
        res.status(500).send(error)
    }
}

module.exports = {
    createBuilding,
    getBuilding,
    deleteBulding,
    repairBuilding,
    addService,
    removeService,
    getABuilding
}