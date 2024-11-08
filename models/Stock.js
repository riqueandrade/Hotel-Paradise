const { pool } = require('../config/database');

class Stock {
    static async findAll() {
        const [rows] = await pool.query(`
            SELECT * FROM stock_items 
            ORDER BY name ASC
        `);
        return rows;
    }

    static async findById(id) {
        const [rows] = await pool.query(`
            SELECT * FROM stock_items 
            WHERE id = ?
        `, [id]);
        return rows[0];
    }

    static async create(itemData) {
        const {
            name,
            category,
            quantity,
            min_quantity,
            price,
            description
        } = itemData;

        const [result] = await pool.query(
            `INSERT INTO stock_items (
                name, category, quantity, min_quantity, 
                price, description
            ) VALUES (?, ?, ?, ?, ?, ?)`,
            [name, category, quantity, min_quantity, price, description]
        );

        return this.findById(result.insertId);
    }

    static async update(id, itemData) {
        const {
            name,
            category,
            quantity,
            min_quantity,
            price,
            description
        } = itemData;

        await pool.query(
            `UPDATE stock_items 
             SET name = ?, category = ?, quantity = ?, 
                 min_quantity = ?, price = ?, description = ?
             WHERE id = ?`,
            [name, category, quantity, min_quantity, price, description, id]
        );

        return this.findById(id);
    }

    static async delete(id) {
        await pool.query('DELETE FROM stock_items WHERE id = ?', [id]);
        return true;
    }

    static async adjustQuantity(id, quantity, type) {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            // Busca o item atual
            const [item] = await connection.query(
                'SELECT quantity FROM stock_items WHERE id = ?',
                [id]
            );

            if (!item[0]) {
                throw new Error('Item não encontrado');
            }

            // Calcula nova quantidade
            const currentQty = item[0].quantity;
            const newQty = type === 'add' ? 
                currentQty + quantity : 
                currentQty - quantity;

            // Verifica se há quantidade suficiente para retirada
            if (type === 'remove' && newQty < 0) {
                throw new Error('Quantidade insuficiente em estoque');
            }

            // Atualiza a quantidade
            await connection.query(
                'UPDATE stock_items SET quantity = ? WHERE id = ?',
                [newQty, id]
            );

            // Registra o movimento
            await connection.query(
                `INSERT INTO stock_movements (
                    item_id, type, quantity, previous_qty, new_qty
                ) VALUES (?, ?, ?, ?, ?)`,
                [id, type, quantity, currentQty, newQty]
            );

            await connection.commit();
            return this.findById(id);

        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }
}

module.exports = Stock; 