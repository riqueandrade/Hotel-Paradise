const { pool } = require('../config/database');

class Reservation {
    static async findAll() {
        const [rows] = await pool.query(`
            SELECT r.*, rm.number as room_number, rm.type as room_type
            FROM reservations r
            JOIN rooms rm ON r.room_id = rm.id
            ORDER BY r.created_at DESC
        `);
        return rows;
    }

    static async findById(id) {
        const [rows] = await pool.query(`
            SELECT r.*, rm.number as room_number, rm.type as room_type
            FROM reservations r
            JOIN rooms rm ON r.room_id = rm.id
            WHERE r.id = ?
        `, [id]);
        return rows[0];
    }

    static async create(reservationData) {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            const { client_id, room_id, check_in, check_out, total_amount } = reservationData;

            const [result] = await connection.query(
                `INSERT INTO reservations 
                    (client_id, room_id, check_in, check_out, total_amount, status)
                 VALUES (?, ?, ?, ?, ?, 'pending')`,
                [client_id, room_id, check_in, check_out, total_amount]
            );

            // Atualiza o status do quarto para ocupado
            await connection.query(
                `UPDATE rooms SET status = 'occupied' WHERE id = ?`,
                [room_id]
            );

            await connection.commit();
            return this.findById(result.insertId);
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    static async update(id, reservationData) {
        try {
            const {
                check_in,
                check_out,
                total_amount,
                status
            } = reservationData;

            await pool.query(
                `UPDATE reservations 
                 SET check_in = ?, check_out = ?, 
                     total_amount = ?, status = ?
                 WHERE id = ?`,
                [check_in, check_out, total_amount, status, id]
            );

            return this.findById(id);
        } catch (error) {
            console.error('Erro ao atualizar reserva:', error);
            throw new Error('Falha ao atualizar reserva');
        }
    }

    static async updateStatus(id, status) {
        const connection = await pool.getConnection();
        
        try {
            await connection.beginTransaction();

            // Atualiza o status da reserva
            await connection.query(
                'UPDATE reservations SET status = ? WHERE id = ?',
                [status, id]
            );

            // Se a reserva for cancelada, libera o quarto
            if (status === 'cancelled') {
                const [reservation] = await connection.query(
                    'SELECT room_id FROM reservations WHERE id = ?',
                    [id]
                );

                if (reservation[0]) {
                    await connection.query(
                        `UPDATE rooms SET status = 'available' WHERE id = ?`,
                        [reservation[0].room_id]
                    );
                }
            }

            await connection.commit();
            return this.findById(id);
        } catch (error) {
            await connection.rollback();
            console.error('Erro ao atualizar status:', error);
            throw new Error('Falha ao atualizar status');
        } finally {
            connection.release();
        }
    }

    static async findByUserId(userId) {
        try {
            console.log('Buscando reservas para usuário:', userId); // Debug

            const [rows] = await pool.query(`
                SELECT 
                    r.*,
                    rm.number as room_number,
                    rm.type as room_type,
                    rm.price_per_night
                FROM reservations r
                JOIN rooms rm ON r.room_id = rm.id
                WHERE r.client_id = ?
                ORDER BY r.created_at DESC
            `, [userId]);

            console.log('Reservas encontradas:', rows); // Debug
            return rows;
        } catch (error) {
            console.error('Erro ao buscar reservas do usuário:', error);
            throw new Error('Falha ao buscar reservas');
        }
    }
}

module.exports = Reservation; 