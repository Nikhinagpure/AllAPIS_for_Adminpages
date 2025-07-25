const express = require('express');
const { getDashboardData } = require('../controllers/dashboard.controller');
const verifyToken = require('../middleware/verifyToken');

module.exports = (pool) => {
  const router = express.Router();

  router.get('/', verifyToken, getDashboardData(pool));

  return router;
};
