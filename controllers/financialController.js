const Financial = require('../models/Financial');

const financialController = {
    // Lista todas as transações
    listTransactions: async (req, res) => {
        try {
            const transactions = await Financial.findAll();
            res.json(transactions);
        } catch (error) {
            console.error('Erro ao listar transações:', error);
            res.status(500).json({ message: 'Erro ao listar transações' });
        }
    },

    // Busca uma transação específica
    getTransaction: async (req, res) => {
        try {
            const transaction = await Financial.findById(req.params.id);
            if (!transaction) {
                return res.status(404).json({ message: 'Transação não encontrada' });
            }
            res.json(transaction);
        } catch (error) {
            console.error('Erro ao buscar transação:', error);
            res.status(500).json({ message: 'Erro ao buscar transação' });
        }
    },

    // Cria uma nova transação
    createTransaction: async (req, res) => {
        try {
            const transaction = await Financial.create(req.body);
            res.status(201).json(transaction);
        } catch (error) {
            console.error('Erro ao criar transação:', error);
            res.status(500).json({ message: 'Erro ao criar transação' });
        }
    },

    // Atualiza uma transação
    updateTransaction: async (req, res) => {
        try {
            const transaction = await Financial.update(req.params.id, req.body);
            if (!transaction) {
                return res.status(404).json({ message: 'Transação não encontrada' });
            }
            res.json(transaction);
        } catch (error) {
            console.error('Erro ao atualizar transação:', error);
            res.status(500).json({ message: 'Erro ao atualizar transação' });
        }
    },

    // Remove uma transação
    deleteTransaction: async (req, res) => {
        try {
            const result = await Financial.delete(req.params.id);
            if (!result) {
                return res.status(404).json({ message: 'Transação não encontrada' });
            }
            res.json({ message: 'Transação removida com sucesso' });
        } catch (error) {
            console.error('Erro ao remover transação:', error);
            res.status(500).json({ message: 'Erro ao remover transação' });
        }
    },

    // Gera relatório por categoria
    getCategoryReport: async (req, res) => {
        try {
            const { startDate, endDate } = req.query;
            const report = await Financial.getCategoryReport(startDate, endDate);
            res.json(report);
        } catch (error) {
            console.error('Erro ao gerar relatório:', error);
            res.status(500).json({ message: 'Erro ao gerar relatório' });
        }
    }
};

module.exports = financialController; 