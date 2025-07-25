const express = require('express');
const { loginUser } = require('../controllers/auth.controller');

module.exports = (pool) => {
  const router = express.Router();
  router.post('/login', loginUser(pool));
  return router;
};
