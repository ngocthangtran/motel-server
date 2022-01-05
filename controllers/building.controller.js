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
                    attributes: ['name'],
                    include: {
                        model: District,
                        attributes: ['name'],
                        include: {
                            model: Province,
                            attributes: ['name'],
                        }
                    }
                }]
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
                address
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
    // const userId = "e493adc1-cd37-4055-a965-b0cecede3373";
    const {
        buildingId,
        name,
        address,
        openTime,
        closeTime
    } = req.body;

    try {
        const result = await Building.update(
            {
                name, address, openTime, closeTime
            },
            {
                where: {
                    userId,
                    buildingId
                }
            }
        )
        console.log(result)
    } catch (error) {
        res.status(500).send(error)
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


module.exports = {
    createBuilding,
    getBuilding,
    deleteBulding,
    repairBuilding,
    addService,
    removeService
}