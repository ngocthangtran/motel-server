const { Renter } = require('../../db');

const validateRenter = async (req, res, next) => {
    const renterId = req.body.renterId || req.params.renterId;
    if (!renterId) return res.status(400).send({ message: "renterID is required" });
    const renter = await Renter.findByPk(renterId);

    if (!renter) {
        res.status(404).send({ message: "cant't not find renterId: " + renterId });
    }
    next();
}

module.exports = { validateRenter }