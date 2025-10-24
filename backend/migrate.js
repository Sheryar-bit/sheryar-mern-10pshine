const fs = require('fs');
const mysql = require('mysql2');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '708sharyar',
  database: 'notesapp',
  multipleStatements: true
});

const migrationSQL = fs.readFileSync('./migration.sql', 'utf8');

pool.query(migrationSQL, (err, results) => {
  if (err) {
    console.error('Migration failed:', err);
  } else {
    console.log('Migration completed successfully');
  }
  pool.end();
});