const values = [
  { name: "Phòng" },
  { name: "Nguyên căn" },
  { name: "Căn hộ" },
  { name: "Căn hộ mini" },
];
module.exports = RoomType => {
  values.forEach(value => {
    RoomType.findOrCreate({ where: { name: value.name }, default: value });
  });
};
