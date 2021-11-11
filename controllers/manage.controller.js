const { Contracts, User, Room, Building, Province, Ward, District } = require('../db');

const convertDate = (date) => {
    const today = new Date(date)
    return `${today.getDate()}-${today.getMonth() + 1}-${today.getFullYear()}`
}

const comparisonDate = (date) => {
    const day = new Date(date).getTime()
    const today = new Date().getTime();
    if (day >= today) {
        return true
    }
    return false
}

const getContractTakeEffect = async (req, res) => {
    const { userId } = req.user;
    try {
        const contract = await Contracts.findAll({
            include: [
                {
                    model: User,
                    attributes: ['userId'],
                    group: ['user.userId'],
                    where: {
                        userId
                    }
                }, {
                    model: Room,
                    include: {
                        model: Building,
                        include: {
                            model: Ward,
                            include: {
                                model: District,
                                include: Province
                            }
                        }
                    }
                }
            ],
        })

        const data = contract.reduce((beforeValue, afterValue, index) => {
            var {
                Room: room,
            } = afterValue.dataValues
            const { Building, name: nameRoom, roomId } = room;
            const { buildingId, name, address } = Building;
            if (!beforeValue.find(value => value.buildingId === buildingId)) {
                beforeValue.push({
                    buildingId: buildingId,
                    name: name,
                    room: [
                        {
                            roomId,
                            name: nameRoom,
                            address,
                            ward: Building.Ward.name,
                            District: Building.Ward.District.name,
                            Province: Building.Ward.District.Province.name,
                        }
                    ]
                })
            } else {
                const indexBulding = beforeValue.findIndex(value => value.buildingId === buildingId)

                beforeValue[indexBulding].room.push({
                    roomId,
                    name: nameRoom,
                    address,
                    ward: Building.Ward.name,
                    District: Building.Ward.District.name,
                    Province: Building.Ward.District.Province.name,
                })
            }
            return beforeValue
        }, [])
        res.send(data)
    } catch (error) {
        console.log(error)
        res.status(500).send(error)
    }
}

module.exports = {
    getContractTakeEffect
}