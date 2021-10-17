const values =
{
    userId: "e493adc1-cd37-4055-a965-b0cecede3373",
    name: "my name",
    email: "fake.mail.gg.com@gmail.com",
    avatar: "https://lh3.googleusercontent.com/a/AATXAJwteYEvpXFyqk0S3_ZMycUPlXL_b09DyuaQMip0=s96-c",
    facebookId: '',
    googleId: '101689282587559746886',

}
module.exports = Users => {
    Users.findOrCreate({ where: { name: value.name }, default: value });

};
