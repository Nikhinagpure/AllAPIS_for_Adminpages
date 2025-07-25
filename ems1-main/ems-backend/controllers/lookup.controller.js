// controllers/lookup.controller.js

const db = require('../db'); // Make sure this is a mysql2/promise pool

/**
 * Fetches all genders from the emp_genders table.
 */
exports.getAllGenders = async (req, res) => {
    try {
        const [rows] = await db.execute("SELECT id, name FROM emp_genders");
        res.json(rows);
    } catch (error) {
        console.error('Error fetching genders:', error);
        res.status(500).json({ error: 'Failed to fetch genders', details: error.message });
    }
};

/**
 * Fetches all departments from the emp_departments table.
 */
exports.getAllDepartments = async (req, res) => {
    try {
        const [rows] = await db.execute("SELECT id, name FROM emp_departments");
        res.json(rows);
    } catch (error) {
        console.error('Error fetching departments:', error);
        res.status(500).json({ error: 'Failed to fetch departments', details: error.message });
    }
};

/**
 * Adds a new department to the emp_departments table.
 */
exports.addDepartment = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ error: 'Department name is required' });
        }

        const [result] = await db.execute(
            "INSERT INTO emp_departments (name, created_at, updated_at) VALUES (?, NOW(), NOW())",
            [name]
        );

        res.status(201).json({ id: result.insertId, name });
    } catch (error) {
        console.error('Error adding department:', error);
        res.status(500).json({ error: 'Failed to add department', details: error.message });
    }
};

/**
 * Fetches all designations from the emp_designations table.
 */
exports.getAllDesignations = async (req, res) => {
    try {
        const [rows] = await db.execute("SELECT id, name FROM emp_designations");
        res.json(rows);
    } catch (error) {
        console.error('Error fetching designations:', error);
        res.status(500).json({ error: 'Failed to fetch designations', details: error.message });
    }
};

/**
 * Fetches all roles from the emp_roles table.
 */
exports.getAllRoles = async (req, res) => {
    try {
        const [rows] = await db.execute("SELECT id, name FROM emp_roles");
        res.json(rows);
    } catch (error) {
        console.error('Error fetching roles:', error);
        res.status(500).json({ error: 'Failed to fetch roles', details: error.message });
    }
};
