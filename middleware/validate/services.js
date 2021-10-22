const { Services } = require('../../db');

const validateServiceId = async (req, res, next) => {
    const serviceId = req.body.serviceId || req.params.serviceId;
    if (!serviceId) return res.status(400).send({
        message: "serviceId is required"
    })
    const service = await Services.findByPk(serviceId)
    
    if (!service) return res.status(404).send({
        message: "can't find serviceId on database"
    });
    next();
}

module.exports = {
    validateServiceId
}