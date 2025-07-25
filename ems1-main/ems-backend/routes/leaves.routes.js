// ems-backend/routes/leaves.routes.js
const express = require('express');
const leavesController = require('../controllers/leaves.controller');
const verifyToken = require('../middleware/verifyToken');
const adminAuth = require('../middleware/adminAuth');

module.exports = function(pool) {
  const router = express.Router();

  router.use(verifyToken); // all routes must be logged-in
  router.use(adminAuth);   // all routes admin only

  // List all
  router.get('/', (req, res) => leavesController.getAllLeaves(req, res, pool));

  // Get by id
  router.get('/:id', (req, res) => leavesController.getLeaveById(req, res, pool));

  // Create/apply leave (admin or on behalf)
  router.post('/', (req, res) => leavesController.applyLeave(req, res, pool));

  // Update
  router.put('/:id', (req, res) => leavesController.updateLeave(req, res, pool));

  // Approve/reject
  router.patch('/:id/approve', (req, res) => leavesController.approveOrRejectLeave(req, res, pool));

  // Delete
  router.delete('/:id', (req, res) => leavesController.deleteLeave(req, res, pool));

  return router;
};
