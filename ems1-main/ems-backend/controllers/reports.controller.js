// ems-backend/controllers/reports.controller.js
const path = require('path');
const fs = require('fs');

module.exports = {
  // List all reports
  getAllReports: async (req, res, pool) => {
    try {
      const [rows] = await pool.query('SELECT * FROM emp_reports ORDER BY generated_on DESC, created_at DESC');
      res.json({ success: true, data: rows });
    } catch (err) {
      res.status(500).json({ success: false, message: "Error fetching reports", error: err.message });
    }
  },

  // Get specific report by ID
  getReportById: async (req, res, pool) => {
    try {
      const [rows] = await pool.query('SELECT * FROM emp_reports WHERE id=?', [req.params.id]);
      if (!rows.length) return res.status(404).json({ success: false, message: "Report not found" });
      res.json({ success: true, data: rows[0] });
    } catch (err) {
      res.status(500).json({ success: false, message: "Error fetching report", error: err.message });
    }
  },

  // Download report file (by emp_reports.id)
  downloadReportFile: async (req, res, pool) => {
    try {
      const [rows] = await pool.query('SELECT file_path FROM emp_reports WHERE id=?', [req.params.id]);
      if (!rows.length || !rows[0].file_path) return res.status(404).json({ success: false, message: "File not found" });
      const filePath = rows[0].file_path;
      if (!fs.existsSync(filePath)) return res.status(404).json({ success: false, message: "File not found" });
      res.download(path.resolve(filePath), path.basename(filePath));
    } catch (err) {
      res.status(500).json({ success: false, message: "Error downloading file", error: err.message });
    }
  },

  // Create ("generate") new report; file upload optional
  generateReport: async (req, res, pool) => {
    const { title, report_id, summary, type, generated_on, generated_by, tags } = req.body;
    const file_path = req.file ? req.file.path : null;

    if (!title || !report_id || !type || !generated_on || !generated_by) {
      return res.status(400).json({
        success: false,
        message: "title, report_id, type, generated_on, generated_by are required"
      });
    }
    try {
      const [result] = await pool.query(
        `INSERT INTO emp_reports (title, report_id, summary, type, generated_on, generated_by, tags, file_path)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [title, report_id, summary, type, generated_on, generated_by, tags, file_path]
      );
      const [rows] = await pool.query('SELECT * FROM emp_reports WHERE id=?', [result.insertId]);
      res.status(201).json({ success: true, data: rows[0], message: "Report created" });
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ success: false, message: "Report ID already exists" });
      }
      res.status(500).json({ success: false, message: "Error creating report", error: err.message });
    }
  },

  // Delete a report
  deleteReport: async (req, res, pool) => {
    try {
      // If file exists, remove it
      const [rows] = await pool.query("SELECT file_path FROM emp_reports WHERE id=?", [req.params.id]);
      if (!rows.length) return res.status(404).json({ success: false, message: "Report not found" });
      const filePath = rows[0].file_path;
      if (filePath && fs.existsSync(filePath)) {
        fs.unlink(filePath, err => { if (err) console.error('File delete error:', err); });
      }
      // Remove row
      const [result] = await pool.query('DELETE FROM emp_reports WHERE id=?', [req.params.id]);
      if (!result.affectedRows) return res.status(404).json({ success: false, message: "Report not found" });
      res.json({ success: true, message: "Report deleted" });
    } catch (err) {
      res.status(500).json({ success: false, message: "Error deleting report", error: err.message });
    }
  },
};
