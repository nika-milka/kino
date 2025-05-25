const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'cinema',
  password: process.env.DB_PASSWORD || 'yourpassword',
  port: process.env.DB_PORT || 5432,
});

// Проверка подключения
pool.query('SELECT NOW()')
  .then(() => console.log('PostgreSQL connected successfully'))
  .catch(err => console.error('PostgreSQL connection error:', err));

module.exports = pool;