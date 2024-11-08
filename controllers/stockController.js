const Stock = require('../models/Stock');

const stockController = {
    // Lista todos os produtos
    listProducts: async (req, res) => {
        try {
            const products = await Stock.findAll();
            res.json(products);
        } catch (error) {
            res.status(500).json({ message: 'Erro ao listar produtos' });
        }
    },

    // Busca um produto específico
    getProduct: async (req, res) => {
        try {
            const product = await Stock.findById(req.params.id);
            if (!product) {
                return res.status(404).json({ message: 'Produto não encontrado' });
            }
            res.json(product);
        } catch (error) {
            res.status(500).json({ message: 'Erro ao buscar produto' });
        }
    },

    // Cria um novo produto
    createProduct: async (req, res) => {
        try {
            const product = await Stock.create(req.body);
            res.status(201).json(product);
        } catch (error) {
            res.status(500).json({ message: 'Erro ao criar produto' });
        }
    },

    // Atualiza um produto
    updateProduct: async (req, res) => {
        try {
            const product = await Stock.update(req.params.id, req.body);
            if (!product) {
                return res.status(404).json({ message: 'Produto não encontrado' });
            }
            res.json(product);
        } catch (error) {
            res.status(500).json({ message: 'Erro ao atualizar produto' });
        }
    },

    // Remove um produto
    deleteProduct: async (req, res) => {
        try {
            const result = await Stock.delete(req.params.id);
            if (!result) {
                return res.status(404).json({ message: 'Produto não encontrado' });
            }
            res.json({ message: 'Produto removido com sucesso' });
        } catch (error) {
            res.status(500).json({ message: 'Erro ao remover produto' });
        }
    },

    // Registra entrada de estoque
    registerEntry: async (req, res) => {
        try {
            const { productId, quantity, supplier, notes } = req.body;
            const result = await Stock.registerEntry(productId, quantity, supplier, notes);
            res.json(result);
        } catch (error) {
            res.status(500).json({ message: 'Erro ao registrar entrada' });
        }
    },

    // Registra saída de estoque
    registerExit: async (req, res) => {
        try {
            const { productId, quantity, destination, notes } = req.body;
            const result = await Stock.registerExit(productId, quantity, destination, notes);
            res.json(result);
        } catch (error) {
            res.status(500).json({ message: 'Erro ao registrar saída' });
        }
    },

    // Lista movimentações de estoque
    listMovements: async (req, res) => {
        try {
            const movements = await Stock.findAllMovements();
            res.json(movements);
        } catch (error) {
            res.status(500).json({ message: 'Erro ao listar movimentações' });
        }
    },

    // Relatório de produtos com estoque baixo
    getLowStockReport: async (req, res) => {
        try {
            const report = await Stock.getLowStockReport();
            res.json(report);
        } catch (error) {
            res.status(500).json({ message: 'Erro ao gerar relatório' });
        }
    },

    // Relatório de movimentações
    getMovementsReport: async (req, res) => {
        try {
            const { startDate, endDate } = req.query;
            const report = await Stock.getMovementsReport(startDate, endDate);
            res.json(report);
        } catch (error) {
            res.status(500).json({ message: 'Erro ao gerar relatório' });
        }
    }
};

module.exports = stockController; 