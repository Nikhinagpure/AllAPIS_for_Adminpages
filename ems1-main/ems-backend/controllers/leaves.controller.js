// ems-backend/controllers/leaves.controller.js

module.exports = {
  // List all leave requests (admin)
  getAllLeaves: async (req, res, pool) => {
    try {
      const [rows] = await pool.query(`
        SELECT l.*, e.user_id AS employee_user_id, e.first_name, e.last_name, a.user_id AS approver_user_id, a.first_name AS approver_first_name, a.last_name AS approver_last_name
        FROM emp_leaves l
        LEFT JOIN emp_employees e ON l.employee_id = e.id
        LEFT JOIN emp_employees a ON l.approved_by = a.id
        ORDER BY l.created_at DESC
      `);
      res.json({ success: true, data: rows });
    } catch (err) {
      res.status(500).json({ success: false, message: "Error fetching leaves", error: err.message });
    }
  },

  // Get leave request by ID (admin)
  getLeaveById: async (req, res, pool) => {
    try {
      const [rows] = await pool.query(`
        SELECT l.*, e.user_id AS employee_user_id, e.first_name, e.last_name, a.user_id AS approver_user_id, a.first_name AS approver_first_name, a.last_name AS approver_last_name
        FROM emp_leaves l
        LEFT JOIN emp_employees e ON l.employee_id = e.id
        LEFT JOIN emp_employees a ON l.approved_by = a.id
        WHERE l.id = ?
      `, [req.params.id]);
      if (rows.length === 0) return res.status(404).json({ success: false, message: "Leave request not found" });
      res.json({ success: true, data: rows[0] });
    } catch (err) {
      res.status(500).json({ success: false, message: "Error fetching leave", error: err.message });
    }
  },

  // Apply for leave (admin on behalf of employee, or employee UI)
  applyLeave: async (req, res, pool) => {
    const { employee_id, start_date, end_date, reason } = req.body;
    if (!employee_id || !start_date || !end_date) {
      return res.status(400).json({ success: false, message: "employee_id, start_date and end_date are required" });
    }
    try {
      const [result] = await pool.query(
        "INSERT INTO emp_leaves (employee_id, start_date, end_date, reason, status) VALUES (?, ?, ?, ?, ?)",
        [employee_id, start_date, end_date, reason || '', 0]
      );
      const [rows] = await pool.query("SELECT * FROM emp_leaves WHERE id = ?", [result.insertId]);
      res.status(201).json({ success: true, data: rows[0], message: "Leave request created" });
    } catch (err) {
      res.status(500).json({ success: false, message: "Error applying for leave", error: err.message });
    }
  },

  // Update leave request (date, reason by admin)
  updateLeave: async (req, res, pool) => {
    const { start_date, end_date, reason, status } = req.body;
    try {
      const fields = [], values = [];
      if (start_date !== undefined) { fields.push('start_date=?'); values.push(start_date); }
      if (end_date !== undefined) { fields.push('end_date=?'); values.push(end_date); }
      if (reason !== undefined) { fields.push('reason=?'); values.push(reason); }
      if (status !== undefined) { fields.push('status=?'); values.push(status); }
      if (fields.length === 0) return res.status(400).json({ success: false, message: "No fields to update" });

      values.push(req.params.id);
      const [result] = await pool.query(
        `UPDATE emp_leaves SET ${fields.join(', ')} WHERE id=?`,
        values
      );
      if (result.affectedRows === 0) return res.status(404).json({ success: false, message: "Leave request not found" });
      const [rows] = await pool.query("SELECT * FROM emp_leaves WHERE id = ?", [req.params.id]);
      res.json({ success: true, data: rows[0], message: "Leave updated" });
    } catch (err) {
      res.status(500).json({ success: false, message: "Error updating leave", error: err.message });
    }
  },

  // Approve or reject leave (admin only)
  approveOrRejectLeave: async (req, res, pool) => {
    const { status } = req.body; // status 1=approved, 2=rejected
    if (![1, 2].includes(Number(status))) {
      return res.status(400).json({ success: false, message: "Status must be 1 (approve) or 2 (reject)" });
    }
    try {
      const adminId = req.user && req.user.employee_id; // You may need to put employee_id in token; if not, pass as param
      const [result] = await pool.query(
        "UPDATE emp_leaves SET status=?, approved_by=?, approved_at=NOW() WHERE id=?",
        [status, adminId || null, req.params.id]
      );
      if (result.affectedRows === 0) return res.status(404).json({ success: false, message: "Leave request not found" });
      const [rows] = await pool.query("SELECT * FROM emp_leaves WHERE id = ?", [req.params.id]);
      res.json({ success: true, data: rows[0], message: status == 1 ? 'Leave approved' : 'Leave rejected' });
    } catch (err) {
      res.status(500).json({ success: false, message: "Error updating leave status", error: err.message });
    }
  },

  // Delete a leave request
  deleteLeave: async (req, res, pool) => {
    try {
      const [result] = await pool.query("DELETE FROM emp_leaves WHERE id = ?", [req.params.id]);
      if (result.affectedRows === 0) return res.status(404).json({ success: false, message: "Leave request not found" });
      res.json({ success: true, message: "Leave request deleted" });
    } catch (err) {
      res.status(500).json({ success: false, message: "Error deleting leave", error: err.message });
    }
  }
};
