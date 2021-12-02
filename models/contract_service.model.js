const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    return sequelize.define('ContractService', {
        startValue: {
            type: DataTypes.INTEGER
        },
        serviceId: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        contractId: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
    }, {
        tableName: 'contracts_services'
    })
}