const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const { User } = require('../db');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const login = async (req, res) => {
  const { token, provider } = req.body;
  switch (provider) {
    case 'Google':
      return loginWithGoogle(res, token);
    case 'Facebook':
      return loginWithFacebook(res, token);
    default:
      res.status(400).send({ error: 'invalid provider' });
  }
};

const loginWithFacebook = async (res, token) => {
  res.send('face');
};

const loginWithGoogle = async (res, idToken) => {
  try {
    // verify google user
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const ggUser = ticket.getPayload();
    // check user exists
    let user = await User.findOne({ where: { googleId: ggUser.sub } });
    // if not, insert new user to db
    if (!user)
      user = await User.create({
        googleId: ggUser.sub,
        email: ggUser.email,
        name: ggUser.name,
        avatar: ggUser.picture,
      });
    user = user.dataValues;
    delete user.googleId;
    delete user.facebookId;
    // send jwt
    const token = await jwt.sign(user, process.env.JWT_SECRET);
    res.send({ token });
  } catch (error) {
    res.status(404).send({ error: error.message });
  }
};

module.exports = { login };
