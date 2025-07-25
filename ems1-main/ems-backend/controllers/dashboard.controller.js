// controllers/dashboard.controller.js
const getDashboardData = (pool) => async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'User not authenticated' });
  }

  const { user_id, role_id } = req.user;
  let connection;

  try {
    connection = await pool.getConnection();

    let data = {};

    switch (role_id) {
      case 1: // Admin dashboard
        const [totalEmployees] = await connection.execute(
          'SELECT COUNT(*) AS count FROM emp_employees WHERE deleted_at IS NULL'
        );
        const [totalDepartments] = await connection.execute(
          'SELECT COUNT(*) AS count FROM emp_departments'
        );
        const [totalDesignations] = await connection.execute(
          'SELECT COUNT(*) AS count FROM emp_designations'
        );
        const [totalProjects] = await connection.execute(
          'SELECT COUNT(*) AS count FROM emp_projects'
        );
        const [totalTasks] = await connection.execute(
          'SELECT COUNT(*) AS count FROM emp_tasks'
        );
        const [totalLeaves] = await connection.execute(
          "SELECT COUNT(*) AS count FROM emp_leaves WHERE status = 1" // approved leaves
        );

        const [presentEmployees] = await connection.execute(
          `SELECT COUNT(DISTINCT employee_id) AS count
           FROM emp_attendances a
           JOIN emp_attendance_statuses s ON a.status_id = s.id
           WHERE s.name = 'Present' AND a.date = CURDATE()`
        );

        const [absentEmployees] = await connection.execute(
          `SELECT COUNT(DISTINCT employee_id) AS count
           FROM emp_attendances a
           JOIN emp_attendance_statuses s ON a.status_id = s.id
           WHERE s.name = 'Absent' AND a.date = CURDATE()`
        );

        const [onLeaveEmployees] = await connection.execute(
          `SELECT COUNT(DISTINCT employee_id) AS count
           FROM emp_leaves
           WHERE status = 1 AND CURDATE() BETWEEN start_date AND end_date`
        );

        // Task counts by status (assuming status is string column)
        const [tasksInProgress] = await connection.execute(
          "SELECT COUNT(*) AS count FROM emp_tasks WHERE status = 'In Progress'"
        );
        const [tasksCompleted] = await connection.execute(
          "SELECT COUNT(*) AS count FROM emp_tasks WHERE status = 'Completed'"
        );
        const [tasksPending] = await connection.execute(
          "SELECT COUNT(*) AS count FROM emp_tasks WHERE status = 'Pending'"
        );

        // Subtask counts by status (assuming same format for emp_subtasks.status)
        const [subtasksInProgress] = await connection.execute(
          "SELECT COUNT(*) AS count FROM emp_subtasks WHERE status = 'In Progress'"
        );
        const [subtasksCompleted] = await connection.execute(
          "SELECT COUNT(*) AS count FROM emp_subtasks WHERE status = 'Completed'"
        );
        const [subtasksPending] = await connection.execute(
          "SELECT COUNT(*) AS count FROM emp_subtasks WHERE status = 'Pending'"
        );

        data = {
          title: 'Admin Dashboard',
          message: `Welcome Admin ${user_id}`,
          stats: {
            totalEmployees: totalEmployees[0].count,
            totalDepartments: totalDepartments[0].count,
            totalDesignations: totalDesignations[0].count,
            totalProjects: totalProjects[0].count,
            totalTasks: totalTasks[0].count,
            totalLeaves: totalLeaves[0].count,
            presentEmployees: presentEmployees[0].count,
            absentEmployees: absentEmployees[0].count,
            onLeaveEmployees: onLeaveEmployees[0].count,
            tasksInProgress: tasksInProgress[0].count,
            tasksCompleted: tasksCompleted[0].count,
            tasksPending: tasksPending[0].count,
            subtasksInProgress: subtasksInProgress[0].count,
            subtasksCompleted: subtasksCompleted[0].count,
            subtasksPending: subtasksPending[0].count,
          },
        };
        break;

      case 2: // HR Dashboard (example)
        // Put your HR-specific queries here
        data = {
          title: 'HR Dashboard',
          message: `Welcome HR ${user_id}`,
          stats: {
            // Example data, add as needed
          },
        };
        break;

      case 3: // Manager Dashboard (example)
        // Put your Manager-specific queries here
        data = {
          title: 'Manager Dashboard',
          message: `Welcome Manager ${user_id}`,
          stats: {
            // Example data, add as needed
          },
        };
        break;

      case 4: // Employee Dashboard (example)
        // Put your Employee-specific queries here
        data = {
          title: 'Employee Dashboard',
          message: `Welcome Employee ${user_id}`,
          stats: {
            // Example data, add as needed
          },
        };
        break;

      default:
        return res.status(403).json({ message: 'Access denied: Unknown role' });
    }

    res.json({ success: true, data });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ message: 'Failed to fetch dashboard data' });
  } finally {
    if (connection) connection.release();
  }
};

module.exports = { getDashboardData };
