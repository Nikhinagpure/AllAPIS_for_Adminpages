// controllers/projects.controller.js
module.exports = {
  // Get all projects
  getAllProjects: async (req, res, pool) => {
    try {
      const [rows] = await pool.query('SELECT * FROM emp_projects ORDER BY created_at DESC');
      res.json({ success: true, data: rows });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Error fetching projects', error: err.message });
    }
  },

  // Get single project by ID
  getProjectById: async (req, res, pool) => {
    try {
      const [rows] = await pool.query('SELECT * FROM emp_projects WHERE id = ?', [req.params.id]);
      if (rows.length === 0) return res.status(404).json({ success: false, message: 'Project not found' });
      res.json({ success: true, data: rows[0] });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Error fetching project', error: err.message });
    }
  },

  // Create new project
  createProject: async (req, res, pool) => {
    const { name, description, status, start_date, end_date } = req.body;
    if (!name || !status) return res.status(400).json({ success: false, message: "Name and status are required" });
    try {
      const [result] = await pool.query(
        'INSERT INTO emp_projects (name, description, status, start_date, end_date) VALUES (?, ?, ?, ?, ?)',
        [name, description, status, start_date, end_date]
      );
      const [rows] = await pool.query('SELECT * FROM emp_projects WHERE id = ?', [result.insertId]);
      res.status(201).json({ success: true, data: rows[0], message: 'Project created' });
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ success: false, message: 'Project name already exists' });
      res.status(500).json({ success: false, message: 'Error creating project', error: err.message });
    }
  },

  // Update/edit project
  updateProject: async (req, res, pool) => {
    const { name, description, status, start_date, end_date } = req.body;
    try {
      const [result] = await pool.query(
        'UPDATE emp_projects SET name=?, description=?, status=?, start_date=?, end_date=? WHERE id=?',
        [name, description, status, start_date, end_date, req.params.id]
      );
      if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Project not found' });
      const [rows] = await pool.query('SELECT * FROM emp_projects WHERE id = ?', [req.params.id]);
      res.json({ success: true, data: rows[0], message: 'Project updated' });
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ success: false, message: 'Project name already exists' });
      res.status(500).json({ success: false, message: 'Error updating project', error: err.message });
    }
  },

  // Delete project
  deleteProject: async (req, res, pool) => {
    try {
      const [result] = await pool.query('DELETE FROM emp_projects WHERE id = ?', [req.params.id]);
      if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Project not found' });
      res.json({ success: true, message: 'Project deleted' });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Error deleting project', error: err.message });
    }
  }
};
