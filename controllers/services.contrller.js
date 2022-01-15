const { Services, FeeBaseOn, User, Building } = require('../db');

const createService = async (req, res) => {
    const {
        name, price, icon, description,
        feeBaseOnsId, unit
    } = req.body;

    if (!name || !price) return res.status(400).send({ status: 400, message: "name, price, unit is required" })
    try {
        const service = await Services.create({
            userId: req.user.userId,
            name, price, icon,
            unit,
            description, fee_base_ons_id: feeBaseOnsId
        }
        )
        res.send(service);
    } catch (error) {
        res.status(500).send(error)
    }
}

const viewAservice = async (req, res) => {
    const { serviceId } = req.params;
    try {
        const service = await FeeBaseOn.findAll({
            include: {
                model: Services,
                where: {
                    serviceId
                }
            }
        });
        res.send(service)
    } catch (error) {
        res.status(500).send(error)
    }
}

const getServiceForUser = async (req, res) => {
    const { userId } = req.user;
    try {
        const services = await Services.findAll({
            where: {
                userId
            }, order: [['createdAt', 'DESC']],
        })
        res.send(services)
    } catch (error) {
        res.status(500).send(error)
    }
}

const getServiceForBuilding = async (req, res) => {
    const { buildingId } = req.params;
    try {
        const service = await Building.findOne({
            include: {
                model: Services,
                as: 'buildingService'
            },
            where: {
                buildingId
            }
        })
        res.send(service.buildingService)
        console.log(service)
    } catch (error) {
        console.log(error)
        res.status(500).send(error)
    }
}

const deleteService = async (req, res) => {
    const { serviceId } = req.params;
    console.log(serviceId)
    if (!serviceId) return res.status(400).send({
        status: 400,
        message: "need serviceId to delete"
    })
    try {
        const service = await Services.destroy({
            where: {
                serviceId
            }
        })
        console.log(service)
        res.send({ status: 200, message: 'delete complete ' + service });
    } catch (error) {
        res.status(400).send(error);
    }
}

const repairService = async (req, res) => {
    const {
        name, price, icon, description,
        feeBaseOnsId, unit, serviceId
    } = req.body;

    try {
        const service = await Services.update(
            {
                name, price, icon, description,
                fee_base_ons_id: feeBaseOnsId, unit
            },
            {
                where: {
                    serviceId
                }
            }
        )
        console.log(service)
        res.send({ status: 200, message: 'repair complete ' + service });
    } catch (error) {

    }
}

module.exports = {
    createService, getServiceForUser,
    getServiceForBuilding, deleteService,
    repairService, viewAservice
}