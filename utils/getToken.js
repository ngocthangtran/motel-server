const jwt = require('jsonwebtoken')

const user = {
    userId: "81ae63a9-cdad-4bd8-8e2f-58e46cc2febe",
    googleId: "101414546713867828201",
    email: "ngocthangkt27@gmail.com",
    name: 'Thang Tran',
    avatar: "https://lh3.googleusercontent.com/a-/AOh14GiNa_kl5phOlwRyvmRbQTtaJdXuLCxfTjRpe3606A=s96-c"
}

const get = async (user) => {
    const a = await jwt.sign(user, 'QRyjjG_z!ocu5zP+}M"~[T!&Ddd`*J');
    console.log(a)
}

get(user)