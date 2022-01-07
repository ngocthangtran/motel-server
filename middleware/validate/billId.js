const { Bill } = require("../../db");

const validateBillId = async (req, res, next) => {
    const billId = req.body.billId || req.params.billId || req.query.billId;

    if (!billId) return res.send({ error: "billId is required" })
    const bill = await Bill.findByPk(billId)
    if (!bill) {
        return res
            .status(400)
            .send({ error: 'cannot find billId with id ' + billId });
    }
    next();
}

module.exports = { validateBillId }