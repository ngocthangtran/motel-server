const { FeeBaseOn } = require("../../db");

const validateFeeBaseOnsId = async (req, res, next) => {
    const { feeBaseOnsId } = req.body;
    if (!feeBaseOnsId) return res.status(400).send({
        status: 400,
        error: "feeBaseOnsId is required"
    })
    const feeBaseOns = await FeeBaseOn.findByPk(feeBaseOnsId)
    if (!feeBaseOns) {
        return res
            .status(400)
            .send({ error: 'cannot find Fee base ons with id ' + feeBaseOnsId });
    }
    req.feeBaseOnsId = feeBaseOnsId;
    next();
}

module.exports = { validateFeeBaseOnsId }