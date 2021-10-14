const { Building, Ward, District, Province } = require('../db');

const createBuilding = async (req, res) => {
    const {
        name,
        address,
        openTime,
        closeTime,
        wardId
    } = req.body;
    const building = await Building.create({
        userId: req.user.userId,
        name,
        address,
        openTime,
        closeTime,
        wardId
    })
    res.status(200).send({ building })
}

const getBuilding = async (req, res) => {
    const { userId } = res.user;
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
    const { buildingId } = req.body;

    try {
        const result = await Building.destroy({
            where: {
                userId,
                buildingId
            }
        })
        console.log(result)
        res.send({
            message: `deleted ${result} line`
        })
    } catch (error) {
        res.status(500).send(error)
    }
}

const repairBuilding = async (req, res) => {
    const {userId} = req.user;

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


module.exports = {
    createBuilding,
    getBuilding,
    deleteBulding,
    repairBuilding
}