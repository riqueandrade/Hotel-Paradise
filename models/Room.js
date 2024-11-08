const { pool } = require('../config/database');

class Room {
    static async findAll() {
        try {
            console.log('Iniciando busca de quartos...');
            
            const [rows] = await pool.query(`
                SELECT * FROM rooms ORDER BY number ASC
            `);
            
            console.log('Dados brutos do banco:', rows);

            // Processa os resultados
            const processedRooms = rows.map(row => {
                console.log('Processando quarto:', row);
                return {
                    id: row.id,
                    number: row.number,
                    type: row.type,
                    description: row.description || '',
                    features: this.parseFeatures(row.features),
                    price_per_night: parseFloat(row.price_per_night || 0),
                    status: row.status || 'available'
                };
            });

            console.log('Quartos processados:', processedRooms);
            return processedRooms;
        } catch (error) {
            console.error('Erro ao buscar quartos:', error);
            throw new Error('Falha ao buscar quartos');
        }
    }

    static parseFeatures(features) {
        if (!features) return [];
        try {
            if (typeof features === 'string') {
                return JSON.parse(features);
            }
            return Array.isArray(features) ? features : [];
        } catch (error) {
            console.error('Erro ao processar características:', error);
            return [];
        }
    }

    static async findById(id) {
        try {
            const [rows] = await pool.query(
                'SELECT * FROM rooms WHERE id = ?',
                [id]
            );
            
            if (!rows[0]) return null;

            const room = rows[0];
            return {
                id: room.id,
                number: room.number,
                type: room.type,
                description: room.description,
                features: this.parseFeatures(room.features),
                price_per_night: parseFloat(room.price_per_night || 0),
                status: room.status || 'available'
            };
        } catch (error) {
            console.error('Erro ao buscar quarto:', error);
            throw new Error('Falha ao buscar quarto');
        }
    }

    static async create(roomData) {
        try {
            const {
                number,
                type,
                description = '',
                features = [],
                price_per_night,
                status = 'available'
            } = roomData;

            const [result] = await pool.query(
                `INSERT INTO rooms (number, type, description, features, price_per_night, status)
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [number, type, description, JSON.stringify(features), price_per_night, status]
            );

            return this.findById(result.insertId);
        } catch (error) {
            console.error('Erro ao criar quarto:', error);
            throw new Error('Falha ao criar quarto');
        }
    }

    static async update(id, roomData) {
        try {
            const {
                number,
                type,
                description,
                features,
                price_per_night,
                status
            } = roomData;

            await pool.query(
                `UPDATE rooms 
                 SET number = ?, type = ?, description = ?, 
                     features = ?, price_per_night = ?, status = ?
                 WHERE id = ?`,
                [number, type, description, JSON.stringify(features), price_per_night, status, id]
            );

            return this.findById(id);
        } catch (error) {
            console.error('Erro ao atualizar quarto:', error);
            throw new Error('Falha ao atualizar quarto');
        }
    }

    static async updateStatus(id, status) {
        try {
            await pool.query(
                'UPDATE rooms SET status = ? WHERE id = ?',
                [status, id]
            );
            return this.findById(id);
        } catch (error) {
            console.error('Erro ao atualizar status:', error);
            throw new Error('Falha ao atualizar status');
        }
    }

    static async delete(id) {
        try {
            console.log('Iniciando exclusão do quarto:', id);

            // Primeiro verifica se o quarto existe e seu status
            const [room] = await pool.query(
                'SELECT * FROM rooms WHERE id = ?',
                [id]
            );

            if (!room[0]) {
                console.log('Quarto não encontrado');
                return false;
            }

            if (room[0].status === 'occupied') {
                console.log('Quarto está ocupado, não pode ser excluído');
                throw new Error('Não é possível excluir um quarto ocupado');
            }

            // Verifica se existem reservas para este quarto
            const [reservations] = await pool.query(
                'SELECT COUNT(*) as count FROM reservations WHERE room_id = ?',
                [id]
            );

            if (reservations[0].count > 0) {
                console.log('Quarto possui reservas, não pode ser excluído');
                throw new Error('Não é possível excluir um quarto com reservas');
            }

            // Se passou pelas validações, exclui o quarto
            const [result] = await pool.query(
                'DELETE FROM rooms WHERE id = ?',
                [id]
            );

            console.log('Resultado da exclusão:', result);
            return result.affectedRows > 0;

        } catch (error) {
            console.error('Erro ao excluir quarto:', error);
            throw error;
        }
    }

    static async findAvailable(checkIn, checkOut, type = '') {
        try {
            let query = `
                SELECT r.* 
                FROM rooms r
                WHERE r.status = 'available'
                AND r.id NOT IN (
                    SELECT room_id 
                    FROM reservations 
                    WHERE (check_in <= ? AND check_out >= ?)
                    AND status != 'cancelled'
                )
            `;

            const params = [checkOut, checkIn];

            if (type) {
                query += ' AND r.type = ?';
                params.push(type);
            }

            query += ' ORDER BY r.number ASC';

            const [rooms] = await pool.query(query, params);

            return rooms.map(room => ({
                ...room,
                features: this.parseFeatures(room.features),
                price_per_night: parseFloat(room.price_per_night)
            }));
        } catch (error) {
            console.error('Erro ao buscar quartos disponíveis:', error);
            throw new Error('Falha ao buscar quartos disponíveis');
        }
    }
}

module.exports = Room; 