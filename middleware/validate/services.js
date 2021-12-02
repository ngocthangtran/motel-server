const { Services } = require('../../db');

const validateServiceId = async (req, res, next) => {
    const serviceId = req.body.serviceId || req.params.serviceId;
    if (!serviceId) return res.status(400).send({
        error: "serviceId is required"
    })
    const service = await Services.findByPk(serviceId)

    if (!service) return res.status(404).send({
        error: "can't find serviceId on database"
    });
    next();
}

const validateServiceArr = async (req, res, next) => {
    const serviceIds = req.body.serviceIds;
    for (serviceId of serviceIds) {
        const service = await Services.findByPk(serviceId.serviceId);
        if (!service)
            return res
                .status(400)
                .send({ error: 'cannot find service with id ' + serviceId });
    }
    next();
};
module.exports = {
    validateServiceId,
    validateServiceArr
}