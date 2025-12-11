// File: src/config/database.js (Corrected)

const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'postgres',
    logging: false,
  }
);

// We will also export the DataTypes for convenience
const { DataTypes } = require('sequelize');

module.exports = { sequelize, DataTypes };