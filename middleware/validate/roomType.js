const { RoomType } = require('../../db');

const validateRoomTypeId = async (req, res, next) => {
  const roomTypeId = req.body.roomTypeId;
  const roomType = await RoomType.findByPk(roomTypeId);

  if (!roomType) {
    console.log(roomType);
    console.log('Loi');
    return res
      .status(400)
      .send({ error: 'cannot find RoomType with id ' + roomTypeId });
  }
  req.roomType = roomType;
  next();
};

module.exports = { validateRoomTypeId };
