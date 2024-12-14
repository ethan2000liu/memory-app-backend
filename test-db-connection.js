const { Client } = require('pg');
require('dotenv').config(); // Load environment variables from .env

// Configure PostgreSQL client
const db = new Client({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

// Test the connection
db.connect()
  .then(() => {
    console.log('Connected to the Supabase database successfully!');
    return db.end();
  })
  .catch((err) => {
    console.error('Database connection error:', err);
  });
