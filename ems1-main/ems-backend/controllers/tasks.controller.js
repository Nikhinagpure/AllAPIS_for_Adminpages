// controllers/tasks.controller.js
module.exports = {

  // Get all tasks (optionally by project)
  getAllTasks: async (req, res, pool) => {
    const projectId = req.query.project_id;
    try {
      let query = 'SELECT * FROM emp_tasks';
      let params = [];
      if (projectId) {
        query += ' WHERE project_id = ?';
        params.push(projectId);
      }
      query += ' ORDER BY created_at DESC';
      const [rows] = await pool.query(query, params);
      res.json({ success: true, data: rows });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Error fetching tasks', error: err.message });
    }
  },

  // Get single task by ID
  getTaskById: async (req, res, pool) => {
    try {
      const [rows] = await pool.query('SELECT * FROM emp_tasks WHERE id = ?', [req.params.id]);
      if (rows.length === 0) return res.status(404).json({ success: false, message: 'Task not found' });
      res.json({ success: true, data: rows[0] });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Error fetching task', error: err.message });
    }
  },

  // Create new task
  createTask: async (req, res, pool) => {
    const { project_id, name, description, status, start_date, end_date } = req.body;
    if (!project_id || !name) return res.status(400).json({ success: false, message: "Project ID and name are required" });
    try {
      const [result] = await pool.query(
        'INSERT INTO emp_tasks (project_id, name, description, status, start_date, end_date) VALUES (?, ?, ?, ?, ?, ?)',
        [project_id, name, description, status || 'Pending', start_date, end_date]
      );
      const [rows] = await pool.query('SELECT * FROM emp_tasks WHERE id = ?', [result.insertId]);
      res.status(201).json({ success: true, data: rows[0], message: 'Task created' });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Error creating task', error: err.message });
    }
  },

  // Update task
  updateTask: async (req, res, pool) => {
    const { project_id, name, description, status, start_date, end_date } = req.body;
    try {
      const [result] = await pool.query(
        'UPDATE emp_tasks SET project_id=?, name=?, description=?, status=?, start_date=?, end_date=? WHERE id=?',
        [project_id, name, description, status, start_date, end_date, req.params.id]
      );
      if (result.affectedRows === 0)
        return res.status(404).json({ success: false, message: 'Task not found' });
      const [rows] = await pool.query('SELECT * FROM emp_tasks WHERE id = ?', [req.params.id]);
      res.json({ success: true, data: rows[0], message: 'Task updated' });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Error updating task', error: err.message });
    }
  },

  // Delete task
  deleteTask: async (req, res, pool) => {
    try {
      const [result] = await pool.query('DELETE FROM emp_tasks WHERE id = ?', [req.params.id]);
      if (result.affectedRows === 0)
        return res.status(404).json({ success: false, message: 'Task not found' });
      res.json({ success: true, message: 'Task deleted' });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Error deleting task', error: err.message });
    }
  }
};
