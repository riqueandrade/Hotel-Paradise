const Reservation = require('../models/Reservation');
const Room = require('../models/Room');

const reservationController = {
    // Lista todas as reservas
    listReservations: async (req, res) => {
        try {
            const reservations = await Reservation.findAll();
            res.json(reservations);
        } catch (error) {
            console.error('Erro ao listar reservas:', error);
            res.status(500).json({ message: 'Erro ao listar reservas' });
        }
    },

    // Busca uma reserva específica
    getReservation: async (req, res) => {
        try {
            const reservation = await Reservation.findById(req.params.id);
            if (!reservation) {
                return res.status(404).json({ message: 'Reserva não encontrada' });
            }
            res.json(reservation);
        } catch (error) {
            console.error('Erro ao buscar reserva:', error);
            res.status(500).json({ message: 'Erro ao buscar reserva' });
        }
    },

    // Cria uma nova reserva
    createReservation: async (req, res) => {
        try {
            console.log('Iniciando criação de reserva:', req.body);
            console.log('Usuário:', req.user);
            
            const {
                room_id,
                check_in,
                check_out,
                total_amount
            } = req.body;

            if (!req.user || !req.user.id) {
                throw new Error('Usuário não autenticado');
            }

            const client_id = req.user.id;

            // Verifica disponibilidade do quarto
            const availableRooms = await Room.findAvailable(check_in, check_out);
            console.log('Quartos disponíveis:', availableRooms);
            
            const roomAvailable = availableRooms.some(room => room.id === parseInt(room_id));
            
            if (!roomAvailable) {
                return res.status(400).json({ 
                    message: 'Quarto não disponível para o período selecionado'
                });
            }

            // Cria a reserva com status pendente
            const reservation = await Reservation.create({
                client_id,
                room_id: parseInt(room_id),
                check_in,
                check_out,
                total_amount: parseFloat(total_amount),
                status: 'pending'
            });

            console.log('Reserva criada:', reservation);

            // Retorna os dados da reserva e a URL de pagamento
            res.status(201).json({
                reservation,
                payment_url: '/html/payment.html'
            });
        } catch (error) {
            console.error('Erro ao criar reserva:', error);
            res.status(500).json({ 
                message: 'Erro ao criar reserva',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    },

    // Atualiza uma reserva
    updateReservation: async (req, res) => {
        try {
            const reservation = await Reservation.update(req.params.id, req.body);
            if (!reservation) {
                return res.status(404).json({ message: 'Reserva não encontrada' });
            }
            res.json(reservation);
        } catch (error) {
            console.error('Erro ao atualizar reserva:', error);
            res.status(500).json({ message: 'Erro ao atualizar reserva' });
        }
    },

    // Cancela uma reserva
    cancelReservation: async (req, res) => {
        try {
            const reservation = await Reservation.updateStatus(req.params.id, 'cancelled');
            if (!reservation) {
                return res.status(404).json({ message: 'Reserva não encontrada' });
            }
            res.json(reservation);
        } catch (error) {
            console.error('Erro ao cancelar reserva:', error);
            res.status(500).json({ message: 'Erro ao cancelar reserva' });
        }
    }
};

module.exports = reservationController; 