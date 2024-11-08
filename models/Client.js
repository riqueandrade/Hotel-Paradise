const { pool } = require('../config/database');

class Client {
    static async findAll() {
        try {
            console.log('Buscando todos os clientes...');
            
            const [rows] = await pool.query(`
                SELECT u.id, u.name, u.email, c.phone, c.cpf, c.address, 
                       c.city, c.state, c.profession, c.visit_reason, 
                       c.social_media, u.status
                FROM users u
                LEFT JOIN clients c ON u.id = c.user_id
                WHERE u.role = 'client'
                ORDER BY u.name ASC
            `);

            console.log(`${rows.length} clientes encontrados`);

            // Processa os resultados
            return rows.map(client => ({
                ...client,
                social_media: typeof client.social_media === 'string' ? 
                    JSON.parse(client.social_media || '{}') : 
                    client.social_media || {}
            }));
        } catch (error) {
            console.error('Erro ao buscar clientes:', error);
            throw new Error('Falha ao buscar clientes');
        }
    }

    static async findById(id) {
        try {
            const [rows] = await pool.query(`
                SELECT u.id, u.name, u.email, c.phone, c.cpf, c.address, 
                       c.city, c.state, c.profession, c.visit_reason, 
                       c.social_media, u.status
                FROM users u
                LEFT JOIN clients c ON u.id = c.user_id
                WHERE u.id = ? AND u.role = 'client'
            `, [id]);

            if (rows[0]) {
                rows[0].social_media = typeof rows[0].social_media === 'string' ? 
                    JSON.parse(rows[0].social_media || '{}') : 
                    rows[0].social_media || {};
            }

            return rows[0];
        } catch (error) {
            console.error('Erro ao buscar cliente:', error);
            throw new Error('Falha ao buscar cliente');
        }
    }

    static async findByEmailOrCPF(email, cpf) {
        try {
            const [rows] = await pool.query(`
                SELECT u.id 
                FROM users u
                LEFT JOIN clients c ON u.id = c.user_id
                WHERE u.email = ? OR c.cpf = ?
            `, [email, cpf]);
            
            return rows[0];
        } catch (error) {
            console.error('Erro ao buscar cliente por email/CPF:', error);
            throw new Error('Falha ao verificar duplicidade');
        }
    }

    static async create(clientData) {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            // Primeiro cria o usuário
            const [userResult] = await connection.query(
                `INSERT INTO users (name, email, role, status)
                 VALUES (?, ?, 'client', 'active')`,
                [clientData.name, clientData.email]
            );

            // Depois cria os dados adicionais do cliente
            await connection.query(
                `INSERT INTO clients (
                    user_id, phone, cpf, address, city, state,
                    profession, visit_reason, social_media
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    userResult.insertId,
                    clientData.phone,
                    clientData.cpf,
                    clientData.address,
                    clientData.city,
                    clientData.state,
                    clientData.profession,
                    clientData.visit_reason,
                    JSON.stringify(clientData.social_media || {})
                ]
            );

            await connection.commit();
            return this.findById(userResult.insertId);
        } catch (error) {
            await connection.rollback();
            console.error('Erro ao criar cliente:', error);
            throw error;
        } finally {
            connection.release();
        }
    }

    static async update(id, clientData) {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            // Atualiza dados do usuário
            await connection.query(
                `UPDATE users 
                 SET name = ?, email = ?, status = ?
                 WHERE id = ?`,
                [clientData.name, clientData.email, clientData.status || 'active', id]
            );

            // Atualiza dados adicionais do cliente
            await connection.query(
                `UPDATE clients 
                 SET phone = ?, address = ?, city = ?, state = ?,
                     profession = ?, visit_reason = ?, social_media = ?
                 WHERE user_id = ?`,
                [
                    clientData.phone,
                    clientData.address,
                    clientData.city,
                    clientData.state,
                    clientData.profession,
                    clientData.visit_reason,
                    JSON.stringify(clientData.social_media || {}),
                    id
                ]
            );

            await connection.commit();
            return this.findById(id);
        } catch (error) {
            await connection.rollback();
            console.error('Erro ao atualizar cliente:', error);
            throw error;
        } finally {
            connection.release();
        }
    }

    static async delete(id) {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            // Remove dados adicionais do cliente
            await connection.query('DELETE FROM clients WHERE user_id = ?', [id]);
            
            // Remove o usuário
            await connection.query('DELETE FROM users WHERE id = ?', [id]);

            await connection.commit();
            return true;
        } catch (error) {
            await connection.rollback();
            console.error('Erro ao deletar cliente:', error);
            throw error;
        } finally {
            connection.release();
        }
    }

    static async findReservations(id) {
        try {
            const [rows] = await pool.query(`
                SELECT r.*, rm.number as room_number, rm.type as room_type
                FROM reservations r
                JOIN rooms rm ON r.room_id = rm.id
                WHERE r.client_id = ?
                ORDER BY r.check_in DESC
            `, [id]);
            return rows;
        } catch (error) {
            console.error('Erro ao buscar reservas:', error);
            throw new Error('Falha ao buscar reservas');
        }
    }
}

module.exports = Client;