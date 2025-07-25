require('dotenv').config(); // Load environment variables before anything else
const mysql = require('mysql2/promise'); // Use the promise variant!

// Create a pool for better scalability (recommended)
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test the connection (optional, for startup diagnostics)
pool.getConnection()
  .then(conn => {
    console.log('Database connected!');
    conn.release();
  })
  .catch(err => {
    console.error('Database connection failed:', err);
  });

module.exports = pool;
