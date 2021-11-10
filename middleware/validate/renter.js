const { Renter } = require('../../db');

const validateRenters = async (req, res, next) => {
    const renterIds = req.body.renterIds || req.params.renterIds;
    if (!renterIds) return res.status(400).send({ message: "renterID is required" });
    for (renterId of renterIds) {
        const renter = await Renter.findByPk(renterId);
        if (!renter)
            return res
                .status(400)
                .send({ error: 'cannot find renter with id ' + renterIds });
    }
    next();
}

const validateRenter = async (req, res, next) => {
    const renterId = req.body.renterId || req.params.renterId;
    if (!renterId) return res.status(400).send({ message: "renterID is required" });
    const renter = await Renter.findByPk(renterId);
    if (!renter)
        return res
            .status(400)
            .send({ error: 'cannot find renter with id ' + renterId });

    next();
}

module.exports = { validateRenters, validateRenter }