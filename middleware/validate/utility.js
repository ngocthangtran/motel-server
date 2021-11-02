const { Utility } = require('../../db');
const validateUtilityIds = async (req, res, next) => {
  const utilityIds = req.body.utilityIds;

  req.utilities = [];
  
  if (!utilityIds) return next();
  if (!Array.isArray(utilityIds)) {
    utilityIds = [utilityIds];
  }
  
  for (utilId of utilityIds) {
    const util = await Utility.findByPk(utilId);
    if (!util)
      return res
        .status(400)
        .send({ error: 'cannot find Utility with id ' + utilId });
    req.utilities.push(util);
  }

  next();
};
module.exports = { validateUtilityIds };
