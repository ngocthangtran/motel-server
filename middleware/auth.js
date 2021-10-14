const chalk = require('chalk');
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const token = req.header('x-auth-token');
  if (!token)
    return res.status(401).send({ error: 'Access denied. No token provided.' });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    console.log(err);
    res.status(400).send({ error: 'Invalid token.' });
  }
};
