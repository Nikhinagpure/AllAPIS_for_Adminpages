const express = require('express');
const projectsController = require('../controllers/projects.controller');

module.exports = function(pool) {
  const router = express.Router();

  router.get('/', (req, res) => projectsController.getAllProjects(req, res, pool));
  router.get('/:id', (req, res) => projectsController.getProjectById(req, res, pool));
  router.post('/', (req, res) => projectsController.createProject(req, res, pool));
  router.put('/:id', (req, res) => projectsController.updateProject(req, res, pool));
  router.delete('/:id', (req, res) => projectsController.deleteProject(req, res, pool));

  return router;
};
