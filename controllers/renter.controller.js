const { Renter, Contracts } = require('../db');

const createRenter = async (req, res) => {
    const {
        name, phone, birthday,
        numberCard, issuedOn
    } = req.body;
    const { userId } = req.user;

    try {
        const renter = await Renter.create({
            name, phone, birthday, numberCard, issuedOn, userId
        })
        res.send(renter);
    } catch (error) {
        res.status(500).send(error)
    }
}

const getRenter = async (req, res) => {
    const { userId } = req.user;

    try {
        const renter = await Renter.findAll({
            include: {
                model: Contracts
            },
            where: {
                userId
            }
        })
        res.send(renter)
    } catch (error) {

    }
}

const repairRenter = async (req, res) => {
    const {
        name, phone, birthday,
        numberCard, issuedOn, renterId
    } = req.body;
    try {
        const renter = await Renter.update(
            {
                name, phone, birthday, numberCard, issuedOn
            },
            {
                where: {
                    renterId
                }
            }
        )
        res.send(
            {
                status: 200,
                message: `${renter} row change`
            }
        )

    } catch (error) {
        res.status(500).send(error)
    }
}

const deleteRenter = async (req, res) => {
    const { renterId } = req.params;

    try {
        const result = await Renter.destroy({
            where: {
                renterId
            }
        })

        res.send({
            status: 200,
            message: `delete ${result} row`
        })
    } catch (error) {

    }
}


module.exports = {
    createRenter, getRenter, repairRenter, deleteRenter
}