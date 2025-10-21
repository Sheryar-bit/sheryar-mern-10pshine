const mysql = require('mysql2');
const logger = require('./config/logger');

const isTestEnv = process.env.NODE_ENV === 'test';

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '708sharyar',
  database: isTestEnv ? 'notesapp_test' : (process.env.DB_NAME || 'notesapp'),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

pool.getConnection((err, connection) => {
  if (err) {
    logger.error({ err }, 'Error connecting to the database');
  } else {
    logger.info(`Connected to the MySQL database: ${isTestEnv ? 'notesapp_test' : 'notesapp'}`);
    connection.release();
  }
});

module.exports = pool;