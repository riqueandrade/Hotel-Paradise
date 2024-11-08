const { pool } = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
    static async findAll() {
        const [rows] = await pool.query('SELECT * FROM users ORDER BY name ASC');
        return rows;
    }

    static async findById(id) {
        try {
            // Busca o usuário junto com os dados de cliente
            const [rows] = await pool.query(`
                SELECT u.*, c.phone, c.cpf, c.address
                FROM users u
                LEFT JOIN clients c ON u.id = c.user_id
                WHERE u.id = ?
            `, [id]);

            if (rows.length === 0) {
                return null;
            }

            // Retorna o usuário com os dados do cliente
            return rows[0];
        } catch (error) {
            console.error('Erro ao buscar usuário:', error);
            throw new Error('Falha ao buscar usuário');
        }
    }

    static async findByEmail(email) {
        try {
            // Busca o usuário junto com os dados de cliente
            const [rows] = await pool.query(`
                SELECT u.*, c.phone, c.cpf, c.address
                FROM users u
                LEFT JOIN clients c ON u.id = c.user_id
                WHERE u.email = ?
            `, [email]);

            if (rows.length === 0) {
                return null;
            }

            // Retorna o usuário com os dados do cliente
            return rows[0];
        } catch (error) {
            console.error('Erro ao buscar usuário por email:', error);
            throw new Error('Falha ao buscar usuário');
        }
    }

    static async create(userData) {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            const {
                name,
                email,
                password,
                role = 'client',
                status = 'active',
                google_id = null,
                phone,
                cpf,
                birth_date,
                department,
                salary
            } = userData;

            // Verifica se o usuário já existe
            const [existingUser] = await connection.query(
                'SELECT * FROM users WHERE email = ?',
                [email]
            );

            if (existingUser.length > 0) {
                return existingUser[0];
            }

            // Hash da senha se fornecida
            let hashedPassword = null;
            if (password) {
                hashedPassword = await bcrypt.hash(password, 10);
            }

            // Define employee_type baseado no role
            const employeeRoles = ['admin', 'manager', 'receptionist', 'housekeeper'];
            const employee_type = employeeRoles.includes(role) ? role : null;

            // Insere o novo usuário
            const [result] = await connection.query(
                `INSERT INTO users (name, email, password, role, employee_type, status, google_id)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [name, email, hashedPassword, role, employee_type, status, google_id]
            );

            // Se for um funcionário, insere na tabela employees
            if (employee_type) {
                await connection.query(
                    `INSERT INTO employees (
                        user_id, name, email, cpf, phone, 
                        birth_date, hire_date, position, 
                        department, salary, status
                    ) VALUES (?, ?, ?, ?, ?, ?, CURDATE(), ?, ?, ?, 'active')`,
                    [
                        result.insertId, name, email, cpf, phone,
                        birth_date, employee_type, department,
                        salary || 0
                    ]
                );
            }

            await connection.commit();

            // Retorna o usuário criado
            const [newUser] = await connection.query(
                'SELECT * FROM users WHERE id = ?',
                [result.insertId]
            );

            return newUser[0];
        } catch (error) {
            await connection.rollback();
            console.error('Erro ao criar usuário:', error);
            throw error;
        } finally {
            connection.release();
        }
    }

    static async update(id, userData) {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            const { name, email, cpf, phone, address, password } = userData;
            
            // Atualiza dados básicos do usuário
            await connection.query(
                `UPDATE users 
                 SET name = ?, email = ?
                 ${password ? ', password = ?' : ''}
                 WHERE id = ?`,
                password ? 
                    [name, email, password, id] : 
                    [name, email, id]
            );

            // Verifica se existe registro na tabela clients
            const [clientExists] = await connection.query(
                'SELECT id FROM clients WHERE user_id = ?',
                [id]
            );

            if (clientExists.length > 0) {
                // Atualiza dados do cliente
                await connection.query(
                    `UPDATE clients 
                     SET phone = ?, cpf = ?, address = ?
                     WHERE user_id = ?`,
                    [phone, cpf, address, id]
                );
            } else {
                // Cria novo registro de cliente
                await connection.query(
                    `INSERT INTO clients (user_id, phone, cpf, address)
                     VALUES (?, ?, ?, ?)`,
                    [id, phone, cpf, address]
                );
            }

            await connection.commit();

            // Retorna usuário atualizado
            const [user] = await connection.query(
                `SELECT u.*, c.phone, c.cpf, c.address
                 FROM users u
                 LEFT JOIN clients c ON u.id = c.user_id
                 WHERE u.id = ?`,
                [id]
            );

            return user[0];
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    static async delete(id) {
        await pool.query('DELETE FROM users WHERE id = ?', [id]);
    }
}

module.exports = User; 