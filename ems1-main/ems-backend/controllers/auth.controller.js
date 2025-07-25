// auth.controller.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const loginUser = (pool) => async (req, res) => {
  const rawUserId = req.body.user_id;
  const user_id = (typeof rawUserId === 'string') ? rawUserId.trim() : '';
  const password = req.body.password;

  if (!user_id || !password) {
    return res.status(400).json({ message: 'User ID and password are required.' });
  }

  if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET is not defined!');
    return res.status(500).json({ message: 'Server configuration error' });
  }

  let connection;
  try {
    connection = await pool.getConnection();

    // Join to get role name
    const sql = `
      SELECT e.user_id, e.password_hash, e.role_id, r.name AS role
      FROM emp_employees e
      LEFT JOIN emp_roles r ON e.role_id = r.id
      WHERE e.user_id = ? AND e.deleted_at IS NULL
      LIMIT 1

    `;
    const [rows] = await connection.execute(sql, [user_id]);

    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid user ID or password.' });
    }

    const user = rows[0];

    const storedHash = typeof user.password_hash === 'string'
      ? user.password_hash
      : user.password_hash.toString('utf8');

    const isMatch = await bcrypt.compare(password, storedHash);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid user ID or password.' });
    }

    // Include role name in token payload
    const tokenPayload = {
      user_id: user.user_id,
      role_id: user.role_id,
      role: user.role.toLowerCase() // e.g., 'admin' in lowercase for consistency
    };

    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        user_id: user.user_id,
        role_id: user.role_id,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    if (connection) connection.release();
  }
};

module.exports = { loginUser };
