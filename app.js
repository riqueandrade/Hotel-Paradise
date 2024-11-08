process.env.NODE_NO_WARNINGS = 1;

const express = require('express');
const path = require('path');
const session = require('express-session');
const passport = require('passport');
const dotenv = require('dotenv');
const { connectDB } = require('./config/database');
const reservationRoutes = require('./routes/reservationRoutes');
const userRoutes = require('./routes/userRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

dotenv.config();

const app = express();

// Configurações do Express
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuração da sessão
app.use(session({
    secret: process.env.SESSION_SECRET || 'seu_secret_aqui',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: false, // Mude para true em produção com HTTPS
        maxAge: 24 * 60 * 60 * 1000 // 24 horas
    }
}));

// Inicialização do Passport
app.use(passport.initialize());
app.use(passport.session());

// Importa configurações do Passport
require('./config/auth');

// Servir arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Conexão com o banco de dados
connectDB();

// Rota para a página inicial
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'html', 'index.html'));
});

// Rota para a página de login
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'html', 'login.html'));
});

// Middleware para logging
app.use((req, res, next) => {
    const timestamp = new Date().toLocaleTimeString('pt-BR');
    const method = req.method.padEnd(7);
    const url = req.url;
    
    // Log simples e objetivo
    console.log(`[${timestamp}] ${method} ${url}`);
    next();
});

// Rotas da API
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/reservations', reservationRoutes);
app.use('/api/users', userRoutes); // Moved this line up to ensure it's registered before the 404 handler
app.use('/api/payments', paymentRoutes);
app.use('/api/employees', require('./routes/employeeRoutes'));

// Middleware de autenticação para rotas protegidas
const protectedPaths = {
    admin: [
        '/html/rooms.html', 
        '/html/clients.html', 
        '/html/employees.html', 
        '/html/stock.html', 
        '/html/financial.html',
        '/html/users.html'
    ],
    employee: ['/html/reservations.html']
};

app.use((req, res, next) => {
    // Verifica se é uma rota protegida
    const isAdminPath = protectedPaths.admin.some(path => req.path === path);
    const isEmployeePath = protectedPaths.employee.some(path => req.path === path);

    if (isAdminPath || isEmployeePath) {
        if (!req.isAuthenticated()) {
            return res.redirect('/html/login.html');
        }

        // Se for employee tentando acessar rota admin
        if (req.user.role === 'employee' && isAdminPath) {
            return res.redirect('/html/reservations.html');
        }
    }
    next();
});

// Rotas protegidas
app.use('/api/rooms', require('./routes/roomRoutes'));
app.use('/api/clients', require('./routes/clientRoutes'));
app.use('/api/employees', require('./routes/employeeRoutes'));
app.use('/api/stock', require('./routes/stockRoutes'));
app.use('/api/financial', require('./routes/financialRoutes'));

// Rota para verificar autenticação
app.get('/api/auth/check', (req, res) => {
    res.json({
        isAuthenticated: req.isAuthenticated(),
        user: req.user
    });
});

// Tratamento de erros
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ 
        error: 'Algo deu errado!',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Rota 404 para páginas não encontradas
app.use((req, res) => {
    // Tenta enviar o arquivo 404.html
    const notFoundPath = path.join(__dirname, 'public', 'html', '404.html');
    
    // Verifica se o arquivo existe antes de tentar enviá-lo
    if (require('fs').existsSync(notFoundPath)) {
        res.status(404).sendFile(notFoundPath);
    } else {
        // Fallback caso o arquivo 404.html não exista
        res.status(404).send('Página não encontrada');
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});

module.exports = app;