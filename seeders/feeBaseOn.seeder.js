
const values = [
    {
        "fee_base_on_id": "8b0871c8-5f03-4507-997f-c2008e67937d",
        "name": "Lỹ tuyến theo chỉ số",
    },
    {
        "fee_base_on_id": "6c368419-c07c-4b72-b8a0-a2b5c96ee030",
        "name": "Theo người",
    },
    {
        "fee_base_on_id": "d6122b9b-3718-4e05-bb5d-406e8efe7875",
        "name": "Theo phòng",
    },
    {
        "fee_base_on_id": "e733f1d3-0032-4e41-9043-2f91a4e10880",
        "name": "Số lần sử dụng",
    },
    {
        "fee_base_on_id": "891e1461-27db-46df-a7b6-442fdfeaef98",
        "name": "Số lần sử dụng",
    }
]

module.exports = FeeBaseOn => {
    values.forEach(value => {
        FeeBaseOn.findOrCreate({ where: { fee_base_on_id: value.fee_base_on_id, name: value.name }, default: value });
    })
}

