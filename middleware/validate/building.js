const { Building } = require("../../db");

const validateBuildId = async (req, res, next) => {
    const { buildingId } = req.body;
    const building = await Building.findByPk(buildingId)
    if (!building) {
        return res
            .status(400)
            .send({ error: 'cannot find building with id ' + buildingId });
    }
    req.buildingId = buildingId;
    next();
}

module.exports = { validateBuildId }