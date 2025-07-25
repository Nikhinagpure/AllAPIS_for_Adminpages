// ems-backend/controllers/documents.controller.js
const path = require('path');
const fs = require('fs');

module.exports = {
  // List all documents, with employee and document type info
  getAllDocuments: async (req, res, pool) => {
    try {
      const [rows] = await pool.query(`
        SELECT d.*, e.user_id, e.first_name, e.last_name,
               t.name AS document_type
        FROM emp_employee_documents d
        JOIN emp_employees e ON d.employee_id = e.id
        JOIN emp_document_types t ON d.document_type_id = t.id
        ORDER BY d.created_at DESC
      `);
      res.json({ success: true, data: rows });
    } catch (err) {
      res.status(500).json({ success: false, message: "Error fetching documents", error: err.message });
    }
  },

  // Get document by ID with info
  getDocumentById: async (req, res, pool) => {
    try {
      const [rows] = await pool.query(`
        SELECT d.*, e.user_id, e.first_name, e.last_name,
               t.name AS document_type
        FROM emp_employee_documents d
        JOIN emp_employees e ON d.employee_id = e.id
        JOIN emp_document_types t ON d.document_type_id = t.id
        WHERE d.id=?
      `, [req.params.id]);
      if (!rows.length) return res.status(404).json({ success: false, message: "Document not found" });
      res.json({ success: true, data: rows[0] });
    } catch (err) {
      res.status(500).json({ success: false, message: "Error fetching document", error: err.message });
    }
  },

  // Download document file
  downloadDocument: async (req, res, pool) => {
    try {
      const [rows] = await pool.query('SELECT file_path FROM emp_employee_documents WHERE id=?', [req.params.id]);
      if (!rows.length) return res.status(404).json({ success: false, message: "Document not found" });
      const filePath = rows[0].file_path;
      if (!filePath || !fs.existsSync(filePath)) return res.status(404).json({ success: false, message: "File not found" });
      res.download(filePath, path.basename(filePath));
    } catch (err) {
      res.status(500).json({ success: false, message: "Error downloading document", error: err.message });
    }
  },

  // Create new document with file upload
  uploadDocument: async (req, res, pool) => {
    const { employee_id, document_type_id, document_number, issued_date, expiry_date } = req.body;
    const file_path = req.file ? req.file.path : null;
    if (!employee_id || !document_type_id || !file_path) {
      return res.status(400).json({ success: false, message: "employee_id, document_type_id and file are required" });
    }
    try {
      const [result] = await pool.query(`
        INSERT INTO emp_employee_documents
        (employee_id, document_type_id, document_number, issued_date, expiry_date, file_path)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [employee_id, document_type_id, document_number, issued_date, expiry_date, file_path]);
      const [rows] = await pool.query('SELECT * FROM emp_employee_documents WHERE id=?', [result.insertId]);
      res.status(201).json({ success: true, data: rows[0], message: "Document uploaded" });
    } catch (err) {
      res.status(500).json({ success: false, message: "Error uploading document", error: err.message });
    }
  },

  // Update document details (can also update file)
  updateDocument: async (req, res, pool) => {
    const { employee_id, document_type_id, document_number, issued_date, expiry_date } = req.body;
    const file_path = req.file ? req.file.path : undefined;
    try {
      // Build dynamic SQL
      const set = [], values = [];
      if (employee_id)         { set.push('employee_id=?'); values.push(employee_id); }
      if (document_type_id)    { set.push('document_type_id=?'); values.push(document_type_id); }
      if (document_number)     { set.push('document_number=?'); values.push(document_number); }
      if (issued_date)         { set.push('issued_date=?'); values.push(issued_date); }
      if (expiry_date)         { set.push('expiry_date=?'); values.push(expiry_date); }
      if (file_path)           { set.push('file_path=?'); values.push(file_path); }

      if (!set.length) return res.status(400).json({ success: false, message: "No fields to update" });
      values.push(req.params.id);

      const [result] = await pool.query(
        `UPDATE emp_employee_documents SET ${set.join(', ')} WHERE id=?`,
        values
      );
      if (!result.affectedRows) return res.status(404).json({ success: false, message: "Document not found" });
      const [rows] = await pool.query('SELECT * FROM emp_employee_documents WHERE id=?', [req.params.id]);
      res.json({ success: true, data: rows[0], message: "Document updated" });
    } catch (err) {
      res.status(500).json({ success: false, message: "Error updating document", error: err.message });
    }
  },

  // Delete document (and remove file)
  deleteDocument: async (req, res, pool) => {
    try {
      // Get file path first
      const [rows] = await pool.query('SELECT file_path FROM emp_employee_documents WHERE id=?', [req.params.id]);
      if (!rows.length) return res.status(404).json({ success: false, message: "Document not found" });

      const filePath = rows[0].file_path;
      // Delete record
      const [result] = await pool.query('DELETE FROM emp_employee_documents WHERE id=?', [req.params.id]);
      if (!result.affectedRows) return res.status(404).json({ success: false, message: "Document not found" });

      // Remove file (if it exists)
      if (filePath && fs.existsSync(filePath)) {
        fs.unlink(filePath, (err) => { if (err) console.error('File delete error:', err); });
      }
      res.json({ success: true, message: "Document deleted" });
    } catch (err) {
      res.status(500).json({ success: false, message: "Error deleting document", error: err.message });
    }
  }
};
