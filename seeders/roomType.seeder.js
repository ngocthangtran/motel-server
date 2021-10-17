const values = [
  { roomTypeId: "1a2769d0-f60a-4f90-8652-b98ba92cc235", name: "Phòng" },
  { roomTypeId: "6dd926e9-3c60-4971-b569-4810b4d345ae", name: "Nguyên căn" },
  { roomTypeId: "c1a9827f-0dd1-44a6-8fe3-e18859945e0d", name: "Căn hộ" },
  { roomTypeId: "f5ae309a-aa58-4d18-8c5f-e69fdd360b46", name: "Căn hộ mini" },
];
module.exports = RoomType => {
  values.forEach(value => {
    RoomType.findOrCreate({ where: { roomTypeId: value.roomTypeId, name: value.name }, default: value });
  });
};
