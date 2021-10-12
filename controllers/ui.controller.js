const { Province, District, Ward } = require('../db');

const getProvinces = async (req, res) => {
    const provinces = await Province.findAll()
    res.send(provinces)
}

const getDistricts = (req, res) => {
    const { provinceId } = req.params;
    District.findAll({
        where: {
            provinceId
        }
    })
        .then(data => {
            if (data.length !== 0) {
                return res.send(data)
            }
            return res.status(404).send({ message: "Cant't not find destrict width provincesId: " + provinceId })
        })
        .catch(err => res.status(500).send(err))
}

const getWards = (req, res) => {
    const { districtId } = req.params
    Ward.findAll({
        where: {
            districtId
        }
    })
        .then(data => {
            if (data.length !== 0) {
                return res.send(data)
            }
            return res.status(404).send({ message: "Cant't not find destrict width provincesId: " + districtId })
        })
        .catch(err => res.status(500).send(err))
}

module.exports = {
    getProvinces,
    getDistricts,
    getWards
}