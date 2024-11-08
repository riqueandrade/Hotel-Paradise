// Importa o modelo de funcionário
const Employee = require('../models/Employee');

// Controlador que gerencia as operações relacionadas aos funcionários
const employeeController = {
    // Lista todos os funcionários
    listEmployees: async (req, res) => {
        try {
            // Busca todos os funcionários no banco de dados
            const employees = await Employee.findAll();
            res.json(employees);
        } catch (error) {
            // Retorna erro caso ocorra algum problema
            res.status(500).json({ message: 'Erro ao listar funcionários' });
        }
    },

    // Busca um funcionário específico pelo ID
    getEmployee: async (req, res) => {
        try {
            // Busca o funcionário pelo ID fornecido
            const employee = await Employee.findById(req.params.id);
            if (!employee) {
                // Retorna erro se não encontrar o funcionário
                return res.status(404).json({ message: 'Funcionário não encontrado' });
            }
            res.json(employee);
        } catch (error) {
            // Retorna erro caso ocorra algum problema
            res.status(500).json({ message: 'Erro ao buscar funcionário' });
        }
    },

    // Cria um novo registro de funcionário
    createEmployee: async (req, res) => {
        try {
            // Extrai os dados necessários do corpo da requisição
            const {
                name,
                email,
                cpf,
                phone,
                birth_date,
                hire_date,
                position,
                department,
                salary,
                experience
            } = req.body;

            // Cria o novo funcionário no banco de dados
            const employee = await Employee.create({
                name,
                email,
                cpf,
                phone,
                birth_date,
                hire_date,
                position,
                department,
                salary,
                experience
            });

            // Retorna o funcionário criado
            res.status(201).json(employee);
        } catch (error) {
            // Retorna erro caso ocorra algum problema
            res.status(500).json({ message: 'Erro ao criar funcionário' });
        }
    },

    // Atualiza os dados de um funcionário existente
    updateEmployee: async (req, res) => {
        try {
            // Atualiza o funcionário com os novos dados
            const employee = await Employee.update(req.params.id, req.body);
            if (!employee) {
                // Retorna erro se não encontrar o funcionário
                return res.status(404).json({ message: 'Funcionário não encontrado' });
            }
            res.json(employee);
        } catch (error) {
            // Retorna erro caso ocorra algum problema
            res.status(500).json({ message: 'Erro ao atualizar funcionário' });
        }
    },

    // Remove um funcionário do sistema
    deleteEmployee: async (req, res) => {
        try {
            // Remove o funcionário do banco de dados
            const result = await Employee.delete(req.params.id);
            if (!result) {
                // Retorna erro se não encontrar o funcionário
                return res.status(404).json({ message: 'Funcionário não encontrado' });
            }
            res.json({ message: 'Funcionário removido com sucesso' });
        } catch (error) {
            // Retorna erro caso ocorra algum problema
            res.status(500).json({ message: 'Erro ao remover funcionário' });
        }
    },

    // Adiciona uma nova avaliação ao funcionário
    addRating: async (req, res) => {
        try {
            // Extrai os dados da avaliação
            const { rating, comment } = req.body;
            // Adiciona a avaliação ao funcionário
            const result = await Employee.addRating(req.params.id, rating, comment);
            res.json(result);
        } catch (error) {
            // Retorna erro caso ocorra algum problema
            res.status(500).json({ message: 'Erro ao adicionar avaliação' });
        }
    },

    // Busca todas as avaliações de um funcionário
    getEmployeeRatings: async (req, res) => {
        try {
            // Recupera as avaliações do funcionário pelo ID
            const ratings = await Employee.findRatings(req.params.id);
            res.json(ratings);
        } catch (error) {
            // Retorna erro caso ocorra algum problema
            res.status(500).json({ message: 'Erro ao buscar avaliações' });
        }
    }
};

// Exporta o controlador para uso em outras partes da aplicação
module.exports = employeeController; 