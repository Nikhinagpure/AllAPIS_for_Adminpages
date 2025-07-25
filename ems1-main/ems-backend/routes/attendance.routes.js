const express = require('express');
const attendanceController = require('../controllers/attendance.controller');
const router = express.Router();

router.post('/checkin', attendanceController.checkIn);
router.post('/checkout', attendanceController.checkOut);
router.get('/statuses', attendanceController.getStatuses);
router.get('/', attendanceController.getAllAttendance);

module.exports = router;
