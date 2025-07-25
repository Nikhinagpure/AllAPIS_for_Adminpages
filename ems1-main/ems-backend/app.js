// app.js

const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
require('dotenv').config(); // Make sure you have a .env file with your DB credentials

// IMPORTANT: Ensure auth.routes.js and dashboard.routes.js export a function
// that takes 'pool' as an argument and returns an Express Router instance,
// similar to how employeeRoutes.js is structured.
const authRoutes = require('./routes/auth.routes'); 
const dashboardRoutes = require('./routes/dashboard.routes'); 
const employeeRoutes = require('./routes/employees.routes'); // Import employee routes
const lookupRoutes = require('./routes/lookup.routes');
const attendanceRoutes = require('./routes/attendance.routes');
const projectsRoutes = require('./routes/projects.routes');
const leavesRoutes = require('./routes/leaves.routes');
const reportsRoutes = require('./routes/reports.routes');
const documentsRoutes = require('./routes/documents.routes');
const tasksRoutes = require('./routes/tasks.routes');

const app = express();
const PORT = process.env.PORT || 3000;

// Check required environment variables
['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME', 'JWT_SECRET'].forEach((name) => {
  if (!process.env[name]) {
    console.error(`Missing environment variable ${name}`);
    process.exit(1);
  }
});

// Create MySQL connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Test database connection on startup
pool.getConnection()
  .then(connection => {
    console.log('Successfully connected to MySQL database pool');
    connection.release(); // Release the connection back to the pool
  })
  .catch(err => {
    console.error('Failed to connect to MySQL database pool:', err);
    process.exit(1); // Exit if database connection cannot be established
  });

app.use(cors());
app.use(express.json()); // JSON body parser

// Mount existing routes, passing the pool
app.use('/api/auth', authRoutes(pool));
app.use('/api/dashboard', dashboardRoutes(pool));

// Mount employee routes, passing the pool
app.use('/api/employees', employeeRoutes(pool)); 

// Mount lookup routes, passing the pool
app.use('/api/lookup', lookupRoutes); 

app.use('/api/attendance', attendanceRoutes);
  
app.use('/api/projects', projectsRoutes(pool));

app.use('/api/tasks', tasksRoutes(pool));

app.use('/api/leaves', leavesRoutes(pool));

app.use('/api/leaves', leavesRoutes(pool));
app.use('/api/documents', documentsRoutes(pool));
app.use('/api/reports', reportsRoutes(pool));

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// Handle graceful shutdown
process.on('SIGINT', async () => {
    console.log('Shutting down server...');
    try {
        await pool.end(); // Close the connection pool
        console.log('MySQL connection pool closed.');
        process.exit(0);
    } catch (err) {
        console.error('Error closing MySQL pool:', err);
        process.exit(1);
    }
});
