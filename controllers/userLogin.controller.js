const {
    User
} = require('../db');
const jwt = require('jsonwebtoken');

const loginWithUser = async (req, res) => {
    const { username, password } = req.body;
    console.log(req.body)
    try {
        const user = await User.findOne({
            where: {
                username, password
            }
        })
        if (!user) {
            return res.status(401).send({
                message: "User or password is false"
            })
        }
        delete user.facebookId;
        delete user.googleId;
        const token = jwt.sign({
            userId: user.userId,
            username, password
        }, process.env.JWT_SECRET)
        res.send({
            token
        })
    } catch (error) {
        console.log(error)
        res.status(500).send(error)
    }
}

const createUser = async (req, res) => {
    const { username, password, name } = req.body;
    try {
        const user = await User.create({
            username, password, name
        })
        res.send(user)
    } catch (error) {
        res.status(500).send(error)
    }
}


module.exports = {
    createUser, loginWithUser
}