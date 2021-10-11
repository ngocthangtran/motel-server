const values = [
  { name: "Wifi", icon: "wifi-outline" },
  { name: "Giữ xe", icon: "bicycle-outline" },
  { name: "Nội thất", icon: "bed-outline" },
  { name: "Bếp", icon: "bonfire-outline" },
  { name: "Bảo vệ", icon: "shield-checkmark-outline" },
];
module.exports = Utility => {
  values.forEach(value => {
    Utility.findOrCreate({ where: { name: value.name }, default: value });
  });
};
