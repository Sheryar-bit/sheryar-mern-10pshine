const mysql = require('mysql2');
const logger = require('./config/logger');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '708sharyar',
  database: 'notesapp',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

pool.getConnection((err, connection) => {
  if (err) {
    logger.error({ err }, 'Error connecting to the database');
  } else {
    logger.info('Connected to the MySQL database');
    connection.release();
  }
});

module.exports = pool;