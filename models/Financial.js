const { pool } = require('../config/database');

class Financial {
    static async findAll() {
        try {
            console.log('Buscando todas as transações...'); // Debug

            const [rows] = await pool.query(`
                SELECT * FROM financial_transactions 
                ORDER BY date DESC, created_at DESC
            `);

            console.log('Transações encontradas:', rows); // Debug
            return rows;
        } catch (error) {
            console.error('Erro ao buscar transações:', error);
            throw error;
        }
    }

    static async findById(id) {
        const [rows] = await pool.query(`
            SELECT * FROM financial_transactions 
            WHERE id = ?
        `, [id]);
        return rows[0];
    }

    static async findByPeriod(startDate, endDate) {
        const [rows] = await pool.query(`
            SELECT * FROM financial_transactions 
            WHERE date BETWEEN ? AND ?
            ORDER BY date DESC, created_at DESC
        `, [startDate, endDate]);
        return rows;
    }

    static async getSummary(startDate, endDate) {
        const [rows] = await pool.query(`
            SELECT 
                SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as total_income,
                SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as total_expenses,
                SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END) as balance,
                COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_transactions
            FROM financial_transactions
            WHERE date BETWEEN ? AND ?
        `, [startDate, endDate]);
        return rows[0];
    }

    static async create(transactionData) {
        const {
            type,
            description,
            amount,
            category,
            date,
            status = 'pending',
            notes,
            user_id
        } = transactionData;

        const [result] = await pool.query(
            `INSERT INTO financial_transactions 
                (type, description, amount, category, date, status, notes, user_id)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [type, description, amount, category, date, status, notes, user_id]
        );

        return this.findById(result.insertId);
    }

    static async update(id, transactionData) {
        const {
            type,
            description,
            amount,
            category,
            date,
            status,
            notes
        } = transactionData;

        await pool.query(
            `UPDATE financial_transactions 
             SET type = ?, description = ?, amount = ?, 
                 category = ?, date = ?, status = ?, notes = ?
             WHERE id = ?`,
            [type, description, amount, category, date, status, notes, id]
        );

        return this.findById(id);
    }

    static async updateStatus(id, status) {
        await pool.query(
            'UPDATE financial_transactions SET status = ? WHERE id = ?',
            [status, id]
        );
        return this.findById(id);
    }

    static async delete(id) {
        const [result] = await pool.query(
            'DELETE FROM financial_transactions WHERE id = ?',
            [id]
        );
        return result.affectedRows > 0;
    }

    static async getCategories() {
        const [rows] = await pool.query(`
            SELECT DISTINCT category, type
            FROM financial_transactions
            ORDER BY category
        `);
        return rows;
    }

    static async getMonthlyReport(year, month) {
        const [rows] = await pool.query(`
            SELECT 
                DATE_FORMAT(date, '%Y-%m-%d') as date,
                type,
                SUM(amount) as total,
                COUNT(*) as transactions
            FROM financial_transactions
            WHERE YEAR(date) = ? AND MONTH(date) = ?
            GROUP BY date, type
            ORDER BY date DESC
        `, [year, month]);
        return rows;
    }

    static async getCategoryReport(startDate, endDate) {
        const [rows] = await pool.query(`
            SELECT 
                category,
                type,
                SUM(amount) as total,
                COUNT(*) as transactions
            FROM financial_transactions
            WHERE date BETWEEN ? AND ?
            GROUP BY category, type
            ORDER BY type, total DESC
        `, [startDate, endDate]);
        return rows;
    }
}

module.exports = Financial; 