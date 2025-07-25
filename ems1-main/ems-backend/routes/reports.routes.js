// ems-backend/routes/reports.routes.js
const express = require('express');
const reportsController = require('../controllers/reports.controller');
const verifyToken = require('../middleware/verifyToken');
const adminAuth = require('../middleware/adminAuth');
const upload = require('../middleware/upload');

module.exports = function(pool) {
  const router = express.Router();
  router.use(verifyToken);
  router.use(adminAuth);

  router.get('/', (req, res) => reportsController.getAllReports(req, res, pool));
  router.get('/:id', (req, res) => reportsController.getReportById(req, res, pool));
  router.get('/:id/download', (req, res) => reportsController.downloadReportFile(req, res, pool));
  router.post('/', upload.single('file'), (req, res) => reportsController.generateReport(req, res, pool));
  router.delete('/:id', (req, res) => reportsController.deleteReport(req, res, pool));

  return router;
};
