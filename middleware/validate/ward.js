const { Ward } = require('../../db');

const validateWardId = async (req, res, next) => {
    const { wardId } = req.body;
    const ward = await Ward.findByPk(wardId);

    if (!ward) {
        return res
            .status(400)
            .send({ error: 'cannot find ward with id ' + wardId });
    }
    req.wardId = wardId;
    next();
};

module.exports = { validateWardId };
