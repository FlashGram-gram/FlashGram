const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // Render сам задаёт переменную
  ssl: { rejectUnauthorized: false }
});

module.exports = pool;
