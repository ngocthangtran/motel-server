const { sequelize } = require('../db');

const suggestionsAddress = async (req, res) => {
    const { value } = req.query;
    const dataAddrees = await sequelize.query(`select * from 
    (select wards.wardId,concat( wards.name,", ", districts.name, ", ",  provinces.name) as address 
    from motel.wards, motel.districts, motel.provinces
    where wards.districtId = districts.districtId and districts.provinceId = provinces.provinceId) myTable
    where address like "%${value}%";`)
    const dataRoom = await sequelize.query(`select * from 
    (
    select wards.wardId,concat( wards.name,", ", districts.name, ", ",  provinces.name) as address 
    from motel.wards, motel.districts, motel.provinces
    where wards.districtId = districts.districtId and districts.provinceId = provinces.provinceId) myAddress,
    (
    select wards.wardId, posts.title, posts.address
    from motel.wards, motel.posts
    where wards.wardId = posts.wardId
    ) myPosts
    where myPosts.wardId = myAddress.wardId and (myAddress.address like "%${value}%" or myPosts.title like "%${value}%" or myPosts.address like "%${value}%")`)
    res.send({
        dataAddrees: dataAddrees[0],
        dataRoom: dataRoom[0]
    })
}

module.exports = {
    suggestionsAddress
}