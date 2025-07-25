const db = require('../db');

// 1. Add/Update Attendance (Check-In)
exports.checkIn = async (req, res) => {
  try {
    const { employee_id, date, status_id, checked_in_at } = req.body;
    if (!employee_id || !date || !status_id) {
      return res.status(400).json({ error: "employee_id, date, status_id required" });
    }
    // Try insert; if duplicate, update
    const [rows] = await db.execute(
      "SELECT id FROM emp_attendances WHERE employee_id = ? AND date = ?",
      [employee_id, date]
    );
    if (rows.length > 0) {
      // update existing
      await db.execute(
        "UPDATE emp_attendances SET status_id=?, checked_in_at=? WHERE employee_id=? AND date=?",
        [status_id, checked_in_at || null, employee_id, date]
      );
      return res.json({ message: "Attendance updated" });
    } else {
      // insert new record
      await db.execute(
        "INSERT INTO emp_attendances (employee_id, date, status_id, checked_in_at) VALUES (?, ?, ?, ?)",
        [employee_id, date, status_id, checked_in_at || null]
      );
      return res.status(201).json({ message: "Attendance added" });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to add/update attendance", details: error.message });
  }
};

// 2. Add Check-Out Time
exports.checkOut = async (req, res) => {
  try {
    const { employee_id, date, checked_out_at } = req.body;
    if (!employee_id || !date || !checked_out_at) {
      return res.status(400).json({ error: "employee_id, date, and checked_out_at are required" });
    }
    const [result] = await db.execute(
      "UPDATE emp_attendances SET checked_out_at = ? WHERE employee_id = ? AND date = ?",
      [checked_out_at, employee_id, date]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Attendance record not found" });
    }
    res.json({ message: "Check-out updated" });
  } catch (error) {
    res.status(500).json({ error: "Failed to update check-out", details: error.message });
  }
};

// 3. Get Status List
exports.getStatuses = async (req, res) => {
  try {
    const [statuses] = await db.execute("SELECT id, name FROM emp_attendance_statuses");
    res.json(statuses);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch statuses", details: error.message });
  }
};

// 4. Get All Attendance (with status name and employee info)
exports.getAllAttendance = async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT a.*, e.name AS employee_name, s.name AS status_name
       FROM emp_attendances a
       JOIN emp_employees e ON a.employee_id = e.id
       JOIN emp_attendance_statuses s ON a.status_id = s.id
       ORDER BY a.date DESC, a.employee_id`
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch attendance", details: error.message });
  }
};
