const jwt = require('jsonwebtoken')

const user = {
    userId: "e493adc1-cd37-4055-a965-b0cecede3373",
    googleId: "101689282587559746886",
    email: "fake.mail.gg.com@gmail.com",
    name: 'Name My',
    avatar: "https://lh3.googleusercontent.com/a/AATXAJwteYEvpXFyqk0S3_ZMycUPlXL_b09DyuaQMip0=s96-c"
}

const get = async (user) => {
    const a = await jwt.sign(user, 'QRyjjG_z!ocu5zP+}M"~[T!&Ddd`*J');
    console.log(a)
}

get(user)