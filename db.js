const { Client } = require('pg');
require('dotenv').config();

const db = new Client({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

db.connect()
  .then(() => console.log('Connected to the database'))
  .catch((err) => console.error('Database connection error', err));

module.exports = db;
