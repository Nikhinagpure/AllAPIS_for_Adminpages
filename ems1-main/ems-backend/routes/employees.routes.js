// routes/employeeRoutes.js

const express = require('express');
const employeeController = require('../controllers/employee.controller'); // Import the controller

/**
 * Defines employee-related API routes.
 * This function takes the MySQL connection pool as an argument
 * and returns a configured Express router.
 * @param {object} pool - The MySQL connection pool.
 * @returns {express.Router} The configured Express router.
 */
module.exports = (pool) => {
    const router = express.Router();

    // Define routes and link them to controller functions, passing the pool
    // The controller functions will receive req, res, and the pool
    // The data transformation (e.g., photo fallback) happens inside the controller.
    router.get('/', (req, res) => employeeController.getAllEmployees(req, res, pool));
    router.post('/', (req, res) => employeeController.createEmployee(req, res, pool));
    router.put('/:id', (req, res) => employeeController.updateEmployee(req, res, pool));
    router.delete('/:id', (req, res) => employeeController.deleteEmployee(req, res, pool));

    return router;
};
