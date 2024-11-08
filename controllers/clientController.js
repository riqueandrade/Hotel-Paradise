// Importa o modelo de Cliente
const Client = require('../models/Client');

// Controlador que gerencia as operações relacionadas aos clientes
const clientController = {
    // Lista todos os clientes
    listClients: async (req, res) => {
        try {
            // Busca todos os clientes no banco de dados
            const clients = await Client.findAll();
            res.json(clients);
        } catch (error) {
            console.error('Erro ao listar clientes:', error);
            res.status(500).json({ 
                message: 'Erro ao listar clientes',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    },

    // Busca um cliente específico pelo ID
    getClient: async (req, res) => {
        try {
            // Busca o cliente pelo ID fornecido
            const client = await Client.findById(req.params.id);
            if (!client) {
                return res.status(404).json({ message: 'Cliente não encontrado' });
            }
            res.json(client);
        } catch (error) {
            console.error('Erro ao buscar cliente:', error);
            res.status(500).json({ message: 'Erro ao buscar cliente' });
        }
    },

    // Cria um novo registro de cliente
    createClient: async (req, res) => {
        try {
            // Extrai os dados necessários do corpo da requisição
            const { name, email, cpf } = req.body;
            
            // Verifica se todos os campos obrigatórios foram fornecidos
            if (!name || !email || !cpf) {
                return res.status(400).json({ 
                    message: 'Nome, email e CPF são obrigatórios' 
                });
            }

            // Verifica se já existe um cliente com o mesmo email ou CPF
            const existingClient = await Client.findByEmailOrCPF(email, cpf);
            if (existingClient) {
                return res.status(400).json({ 
                    message: 'Já existe um cliente com este email ou CPF' 
                });
            }

            // Cria o novo cliente no banco de dados
            const client = await Client.create(req.body);
            res.status(201).json(client);
        } catch (error) {
            console.error('Erro ao criar cliente:', error);
            res.status(500).json({ 
                message: 'Erro ao criar cliente',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    },

    // Atualiza os dados de um cliente existente
    updateClient: async (req, res) => {
        try {
            // Atualiza o cliente com os novos dados
            const client = await Client.update(req.params.id, req.body);
            if (!client) {
                return res.status(404).json({ message: 'Cliente não encontrado' });
            }
            res.json(client);
        } catch (error) {
            console.error('Erro ao atualizar cliente:', error);
            res.status(500).json({ 
                message: 'Erro ao atualizar cliente',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    },

    // Remove um cliente do sistema
    deleteClient: async (req, res) => {
        try {
            // Busca as reservas do cliente
            const reservations = await Client.findReservations(req.params.id);
            
            // Verifica se existem reservas ativas (pendentes ou confirmadas)
            const hasActiveReservations = reservations.some(
                r => ['pending', 'confirmed'].includes(r.status)
            );

            // Impede a exclusão se houver reservas ativas
            if (hasActiveReservations) {
                return res.status(400).json({ 
                    message: 'Não é possível excluir um cliente com reservas ativas' 
                });
            }

            // Remove o cliente do banco de dados
            const result = await Client.delete(req.params.id);
            if (!result) {
                return res.status(404).json({ message: 'Cliente não encontrado' });
            }

            res.json({ message: 'Cliente removido com sucesso' });
        } catch (error) {
            console.error('Erro ao remover cliente:', error);
            res.status(500).json({ 
                message: 'Erro ao remover cliente',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    },

    // Busca todas as reservas associadas a um cliente
    getClientReservations: async (req, res) => {
        try {
            // Recupera as reservas do cliente pelo ID
            const reservations = await Client.findReservations(req.params.id);
            res.json(reservations);
        } catch (error) {
            console.error('Erro ao buscar reservas:', error);
            res.status(500).json({ message: 'Erro ao buscar reservas do cliente' });
        }
    }
};

// Exporta o controlador para uso em outras partes da aplicação
module.exports = clientController; 