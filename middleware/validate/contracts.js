const { Contracts } = require("../../db");

const validateContractId = async (req, res, next) => {
    const contractId = req.body.contractId || req.params.contractId || req.query.contractId;
    if (!contractId) return res.send({ error: "contractId is required" })
    const contract = await Contracts.findByPk(contractId)
    if (!contract) {
        return res
            .status(400)
            .send({ error: 'cannot find contract with id ' + contractId });
    }
    req.contractId = contractId;
    next();
}

module.exports = { validateContractId }