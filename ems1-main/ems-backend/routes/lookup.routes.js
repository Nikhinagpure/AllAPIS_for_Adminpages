const express = require('express');
const lookupController = require('../controllers/lookup.controller');

const router = express.Router();

// Routes for fetching dropdown data
router.get('/genders', lookupController.getAllGenders);
router.get('/departments', lookupController.getAllDepartments);
router.get('/designations', lookupController.getAllDesignations);
router.get('/roles', lookupController.getAllRoles);
router.post('/departments', lookupController.addDepartment);
module.exports = router;
