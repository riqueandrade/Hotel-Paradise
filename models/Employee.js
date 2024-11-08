const { pool } = require('../config/database');

class Employee {
    static async findAll() {
        const [rows] = await pool.query(`
            SELECT e.*, u.email, u.status
            FROM employees e
            JOIN users u ON e.user_id = u.id
            ORDER BY e.name ASC
        `);
        return rows;
    }

    static async findById(id) {
        try {
            console.log('Buscando funcionário por ID:', id); // Debug
            
            const [rows] = await pool.query(`
                SELECT 
                    e.*,
                    u.email,
                    u.status,
                    u.role
                FROM employees e
                JOIN users u ON e.user_id = u.id
                WHERE e.id = ?
            `, [id]);

            console.log('Resultado da busca:', rows); // Debug

            if (rows.length === 0) {
                return null;
            }

            return rows[0];
        } catch (error) {
            console.error('Erro ao buscar funcionário por ID:', error);
            throw error;
        }
    }

    static async create(employeeData) {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            // Primeiro cria o usuário
            const [userResult] = await connection.query(
                `INSERT INTO users (name, email, role, status)
                 VALUES (?, ?, ?, 'active')`,
                [employeeData.name, employeeData.email, employeeData.role]
            );

            // Depois cria o funcionário
            const [employeeResult] = await connection.query(
                `INSERT INTO employees (
                    user_id, name, email, cpf, phone,
                    birth_date, hire_date, position,
                    department, salary, status
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')`,
                [
                    userResult.insertId,
                    employeeData.name,
                    employeeData.email,
                    employeeData.cpf,
                    employeeData.phone,
                    employeeData.birth_date,
                    employeeData.hire_date,
                    employeeData.role,
                    employeeData.department,
                    employeeData.salary
                ]
            );

            await connection.commit();
            return this.findById(employeeResult.insertId);

        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    static async update(id, employeeData) {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            // Atualiza o funcionário
            await connection.query(
                `UPDATE employees SET
                    name = ?,
                    email = ?,
                    cpf = ?,
                    phone = ?,
                    birth_date = ?,
                    hire_date = ?,
                    position = ?,
                    department = ?,
                    salary = ?,
                    status = ?
                WHERE id = ?`,
                [
                    employeeData.name,
                    employeeData.email,
                    employeeData.cpf,
                    employeeData.phone,
                    employeeData.birth_date,
                    employeeData.hire_date,
                    employeeData.role,
                    employeeData.department,
                    employeeData.salary,
                    employeeData.status,
                    id
                ]
            );

            // Atualiza o usuário correspondente
            const [employee] = await connection.query(
                'SELECT user_id FROM employees WHERE id = ?',
                [id]
            );

            if (employee[0]) {
                await connection.query(
                    `UPDATE users SET
                        name = ?,
                        email = ?,
                        role = ?,
                        status = ?
                    WHERE id = ?`,
                    [
                        employeeData.name,
                        employeeData.email,
                        employeeData.role,
                        employeeData.status,
                        employee[0].user_id
                    ]
                );
            }

            await connection.commit();
            return this.findById(id);

        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    static async delete(id) {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            // Busca o user_id antes de deletar
            const [employee] = await connection.query(
                'SELECT user_id FROM employees WHERE id = ?',
                [id]
            );

            // Deleta o funcionário
            await connection.query('DELETE FROM employees WHERE id = ?', [id]);

            // Deleta o usuário correspondente
            if (employee[0]) {
                await connection.query('DELETE FROM users WHERE id = ?', [employee[0].user_id]);
            }

            await connection.commit();
            return true;

        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }
}

module.exports = Employee; 