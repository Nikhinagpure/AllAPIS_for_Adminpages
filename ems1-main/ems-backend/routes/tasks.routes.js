// ems-backend/routes/tasks.routes.js
const express = require('express');
const tasksController = require('../controllers/tasks.controller');
const verifyToken = require('../middleware/verifyToken');
const adminAuth = require('../middleware/adminAuth');

module.exports = function(pool) {
  const router = express.Router();

  // Protect ALL task routes for admins only!
  router.use(verifyToken);
  router.use(adminAuth);

  // Define routes
  router.get('/', (req, res) => tasksController.getAllTasks(req, res, pool));
  router.get('/:id', (req, res) => tasksController.getTaskById(req, res, pool));
  router.post('/', (req, res) => tasksController.createTask(req, res, pool));
  router.put('/:id', (req, res) => tasksController.updateTask(req, res, pool));
  router.delete('/:id', (req, res) => tasksController.deleteTask(req, res, pool));

  return router;
};
