const Room = require('../models/Room');

const roomController = {
    // Lista todos os quartos
    listRooms: async (req, res) => {
        try {
            const rooms = await Room.findAll();
            res.json(rooms);
        } catch (error) {
            console.error('Erro ao listar quartos:', error);
            res.status(500).json({ 
                message: 'Erro ao listar quartos',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    },

    // Busca um quarto específico
    getRoom: async (req, res) => {
        try {
            const room = await Room.findById(req.params.id);
            if (!room) {
                return res.status(404).json({ message: 'Quarto não encontrado' });
            }
            res.json(room);
        } catch (error) {
            console.error('Erro ao buscar quarto:', error);
            res.status(500).json({ message: 'Erro ao buscar quarto' });
        }
    },

    // Cria um novo quarto
    createRoom: async (req, res) => {
        try {
            const room = await Room.create(req.body);
            res.status(201).json(room);
        } catch (error) {
            console.error('Erro ao criar quarto:', error);
            res.status(500).json({ 
                message: 'Erro ao criar quarto',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    },

    // Atualiza um quarto
    updateRoom: async (req, res) => {
        try {
            const room = await Room.update(req.params.id, req.body);
            if (!room) {
                return res.status(404).json({ message: 'Quarto não encontrado' });
            }
            res.json(room);
        } catch (error) {
            console.error('Erro ao atualizar quarto:', error);
            res.status(500).json({ message: 'Erro ao atualizar quarto' });
        }
    },

    // Remove um quarto
    deleteRoom: async (req, res) => {
        try {
            console.log('Tentando deletar quarto:', req.params.id);
            
            // Verifica se o quarto existe
            const room = await Room.findById(req.params.id);
            if (!room) {
                return res.status(404).json({ message: 'Quarto não encontrado' });
            }

            // Verifica se o quarto está ocupado
            if (room.status === 'occupied') {
                return res.status(400).json({ 
                    message: 'Não é possível excluir um quarto ocupado' 
                });
            }

            const result = await Room.delete(req.params.id);
            if (!result) {
                throw new Error('Falha ao excluir quarto');
            }

            res.json({ message: 'Quarto removido com sucesso' });
        } catch (error) {
            console.error('Erro ao deletar quarto:', error);
            res.status(500).json({ 
                message: 'Erro ao remover quarto',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    },

    // Atualiza o status de um quarto
    updateStatus: async (req, res) => {
        try {
            const { status } = req.body;
            const room = await Room.updateStatus(req.params.id, status);
            if (!room) {
                return res.status(404).json({ message: 'Quarto não encontrado' });
            }
            res.json(room);
        } catch (error) {
            console.error('Erro ao atualizar status:', error);
            res.status(500).json({ message: 'Erro ao atualizar status' });
        }
    },

    // Busca quartos disponíveis
    getAvailableRooms: async (req, res) => {
        try {
            const { check_in, check_out, type } = req.query;

            // Validações básicas
            if (!check_in || !check_out) {
                return res.status(400).json({ 
                    message: 'Datas de check-in e check-out são obrigatórias' 
                });
            }

            // Converte as datas
            const checkInDate = new Date(check_in);
            const checkOutDate = new Date(check_out);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            // Validações de datas
            if (checkInDate < today) {
                return res.status(400).json({ 
                    message: 'Data de check-in não pode ser anterior a hoje' 
                });
            }

            if (checkOutDate <= checkInDate) {
                return res.status(400).json({ 
                    message: 'Data de check-out deve ser posterior ao check-in' 
                });
            }

            // Busca quartos disponíveis
            const rooms = await Room.findAvailable(check_in, check_out, type);
            
            res.json(rooms);
        } catch (error) {
            console.error('Erro ao buscar quartos disponíveis:', error);
            res.status(500).json({ 
                message: 'Erro ao buscar quartos disponíveis',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }
};

module.exports = roomController; 