const { sequelize } = require('../db');

const suggestionsAddress = async (req, res) => {
    const { value } = req.query;
    const data = await sequelize.query(`select * from 
    (select wards.wardId,concat( wards.name,", ", districts.name, ", ",  provinces.name) as address 
    from motel.wards, motel.districts, motel.provinces
    where wards.districtId = districts.districtId and districts.provinceId = provinces.provinceId) myTable
    where address like "%${value}%";`)
    res.send(data[0])
}

module.exports = {
    suggestionsAddress
}