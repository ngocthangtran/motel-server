const { RoomType } = require('../../db');

const validateRoomTypeId = async (req, res, next) => {
  const roomTypeId = req.body.roomTypeId || req.query.roomTypeId;
  const roomType = await RoomType.findByPk(roomTypeId);

  if (!roomType) {
    return res
      .status(400)
      .send({ error: 'cannot find RoomType with id ' + roomTypeId });
  }
  req.roomType = roomType;
  next();
};

module.exports = { validateRoomTypeId };
