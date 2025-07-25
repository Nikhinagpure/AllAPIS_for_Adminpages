// controllers/employeeController.js

/**
 * Fetches all employees from the database.
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {object} pool - MySQL connection pool, passed from the router.
 */
exports.getAllEmployees = async (req, res, pool) => {
    try {
        // Updated SQL query to include LEFT JOIN with emp_departments
        const [rows] = await pool.execute(
            `SELECT 
                e.id, 
                e.user_id,
                e.first_name, 
                e.last_name, 
                e.email, 
                e.phone, 
                e.gender_id, 
                DATE_FORMAT(e.date_of_birth, '%Y-%m-%d') AS date_of_birth, 
                DATE_FORMAT(e.joining_date, '%Y-%m-%d') AS joining_date, 
                e.address, 
                e.designation_id, 
                e.role_id,
                e.department_id, -- Assuming department_id exists in emp_employees
                d.name AS designation_name, 
                r.name AS role_name,        
                g.name AS gender_name,
                dept.name AS department_name -- Added department name from emp_departments
            FROM 
                emp_employees e
            LEFT JOIN 
                emp_designations d ON e.designation_id = d.id 
            LEFT JOIN
                emp_roles r ON e.role_id = r.id      
            LEFT JOIN
                emp_genders g ON e.gender_id = g.id  
            LEFT JOIN
                emp_departments dept ON e.department_id = dept.id -- Joined with emp_departments
            `
        );

        const employees = rows.map(emp => ({
            id: emp.id,
            user_id: emp.user_id,
            name: `${emp.first_name || ''} ${emp.last_name || ''}`.trim(), 
            email: emp.email,
            phone: emp.phone,
            gender_id: emp.gender_id,
            gender_name: emp.gender_name, 
            date_of_birth: emp.date_of_birth,
            joiningDate: emp.joining_date, 
            address: emp.address,
            designation_id: emp.designation_id,
            designation: emp.designation_name, // This is the designation name
            role_id: emp.role_id,
            role_name: emp.role_name, 
            department_id: emp.department_id, // Include department_id
            department: emp.department_name, // Mapped to 'department' for frontend use
        }));

        res.json(employees);
    } catch (error) {
        console.error('Error fetching employees:', error);
        res.status(500).json({ error: 'Failed to fetch employees', details: error.message });
    }
};

/**
 * Creates a new employee in the database.
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {object} pool - MySQL connection pool, passed from the router.
 */
exports.createEmployee = async (req, res, pool) => {
    // Destructure all expected fields from the request body, matching DB columns
    const { 
        first_name, last_name, email, phone, gender_id, 
        date_of_birth, joining_date, address, password_hash, designation_id, role_id, department_id // Added department_id
    } = req.body;

    // Basic validation for essential fields
    if (!first_name || !last_name || !email || !joining_date || !password_hash) {
        return res.status(400).json({ error: 'Missing required employee fields (id, user_id, first_name, last_name, email, joining_date, password_hash)' });
    }

    try {
        const query = `
            INSERT INTO emp_employees (
                first_name, last_name, email, phone, gender_id, 
                date_of_birth, joining_date, address, password_hash, designation_id, role_id, department_id
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const [result] = await pool.execute(query, [
            first_name, last_name, email, phone || null, gender_id || null, 
            date_of_birth || null, joining_date, address || null, password_hash, designation_id || null, role_id || null, department_id || null
        ]);
        
        res.status(201).json({ message: 'Employee added successfully', employee: req.body, insertId: result.insertId });
    } catch (error) {
        console.error('Error adding employee:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: 'Employee with this ID or email already exists', details: error.message });
        }
        res.status(500).json({ error: 'Failed to add employee', details: error.message });
    }
};

/**
 * Updates an existing employee in the database.
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {object} pool - MySQL connection pool, passed from the router.
 */
exports.updateEmployee = async (req, res, pool) => {
    const employeeId = req.params.id;
    // Destructure all updatable fields from the request body, matching DB columns
    const { 
        first_name, last_name, email, phone, gender_id, 
        date_of_birth, joining_date, address, password_hash, designation_id, role_id, department_id // Added department_id
    } = req.body;

    // Build the SET clause dynamically based on provided fields
    let setClauses = [];
    let queryParams = [];

    if (first_name !== undefined) { setClauses.push('first_name = ?'); queryParams.push(first_name); }
    if (last_name !== undefined) { setClauses.push('last_name = ?'); queryParams.push(last_name); }
    if (email !== undefined) { setClauses.push('email = ?'); queryParams.push(email); }
    if (phone !== undefined) { setClauses.push('phone = ?'); queryParams.push(phone); }
    if (gender_id !== undefined) { setClauses.push('gender_id = ?'); queryParams.push(gender_id); }
    if (date_of_birth !== undefined) { setClauses.push('date_of_birth = ?'); queryParams.push(date_of_birth); }
    if (joining_date !== undefined) { setClauses.push('joining_date = ?'); queryParams.push(joining_date); }
    if (address !== undefined) { setClauses.push('address = ?'); queryParams.push(address); }
    if (password_hash !== undefined) { setClauses.push('password_hash = ?'); queryParams.push(password_hash); }
    if (designation_id !== undefined) { setClauses.push('designation_id = ?'); queryParams.push(designation_id); }
    if (role_id !== undefined) { setClauses.push('role_id = ?'); queryParams.push(role_id); }
    if (department_id !== undefined) { setClauses.push('department_id = ?'); queryParams.push(department_id); } // Added department_id
    // Note: user_id, created_at, updated_at, deleted_at are typically not updated via this endpoint

    if (setClauses.length === 0) {
        return res.status(400).json({ error: 'No fields provided for update' });
    }

    try {
        const query = `
            UPDATE emp_employees
            SET ${setClauses.join(', ')}
            WHERE id = ?
        `;
        queryParams.push(employeeId); // Add the ID to the end of parameters

        const [result] = await pool.execute(query, queryParams);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Employee not found' });
        }
        res.json({ message: 'Employee updated successfully', employeeId: employeeId, updatedFields: req.body });
    } catch (error) {
        console.error('Error updating employee:', error);
        if (error.code === 'ER_DUP_ENTRY') { // Handle unique constraint violations
            return res.status(409).json({ error: 'Email already exists for another employee.', details: error.message });
        }
        res.status(500).json({ error: 'Failed to update employee', details: error.message });
    }
};

/**
 * Deletes an employee from the database.
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {object} pool - MySQL connection pool, passed from the router.
 */
exports.deleteEmployee = async (req, res, pool) => {
    const employeeId = req.params.id;

    try {
        const [result] = await pool.execute("DELETE FROM emp_employees WHERE id = ?", [employeeId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Employee not found' });
        }
        res.json({ message: 'Employee deleted successfully', employeeId: employeeId });
    } catch (error) {
        console.error('Error deleting employee:', error);
        res.status(500).json({ error: 'Failed to delete employee', details: error.message });
    }
};
