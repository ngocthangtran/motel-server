const { Sequelize } = require('sequelize');
const modelDefiners = require('../models');
const { setAssociations } = require('../models/associations');
const { roomTypeSeeder, utilitySeeder, FeeBaseOnSeeder } = require('../seeders');

console.log({
  a: process.env.DB_NAME,
  b: process.env.DB_USERNAME,
  c: process.env.DB_PASSWORD,
})

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USERNAME,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',
    logging: false,
  }
);

// define models (exported from /models/index)
const models = Object.keys(modelDefiners).reduce((models, key) => {
  models[key] = modelDefiners[key](sequelize);
  return models;
}, {});

setAssociations(models);

// seeders - uncomment to seed after tables already exists
// roomTypeSeeder(models.RoomType);
// utilitySeeder(models.Utility);
// FeeBaseOnSeeder(models.FeeBaseOn);

module.exports = { sequelize, ...models };
