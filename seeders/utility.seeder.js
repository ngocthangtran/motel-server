const values = [
  { utilityId: "4f610ab9-7501-4782-b455-6f2df6866107", name: "Wifi", icon: "wifi-outline" },
  { utilityId: "68415169-6a70-46ed-b6ab-5c1c345bc46c", name: "Giữ xe", icon: "bicycle-outline" },
  { utilityId: "747b5af0-e1b4-4b52-8685-e6aab9253872", name: "Nội thất", icon: "bed-outline" },
  { utilityId: "ba5504a9-0c66-4a21-9719-71aa37713d6a", name: "Bếp", icon: "bonfire-outline" },
  { utilityId: "ca45c7a1-b8e8-45fc-a888-f81886f03c42", name: "Bảo vệ", icon: "shield-checkmark-outline" },
];
module.exports = Utility => {
  values.forEach(value => {
    Utility.findOrCreate({ where: { utilityId: value.utilityId, name: value.name }, default: value });
  });
};
