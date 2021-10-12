const { Province } = require("../../db");

const validateProvinceId = async (req, res, next) => {
    const { provinceId } = req.body;
    const province = await Province.findByPk(provinceId)
    if (!province) {
        return res
            .status(400)
            .send({ error: 'cannot find province with id ' + provinceId });
    }
    req.provinceId = provinceId;
    next();
}

module.exports = { validateProvinceId }