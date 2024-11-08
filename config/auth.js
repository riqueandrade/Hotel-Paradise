// Importação das dependências necessárias
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// Configuração da estratégia de autenticação local
passport.use(new LocalStrategy({
    usernameField: 'email', // Define o campo de email como username
    passwordField: 'password' // Define o campo de senha
}, async (email, password, done) => {
    try {
        // Busca o usuário pelo email
        const user = await User.findByEmail(email);
        
        // Se não encontrar o usuário, retorna erro
        if (!user) {
            return done(null, false, { message: 'Email não encontrado' });
        }

        // Verifica se a senha está correta
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return done(null, false, { message: 'Senha incorreta' });
        }

        // Se tudo estiver correto, retorna o usuário
        return done(null, user);
    } catch (error) {
        return done(error);
    }
}));

// Configuração da estratégia de autenticação do Google
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID, // ID do cliente Google
    clientSecret: process.env.GOOGLE_CLIENT_SECRET, // Chave secreta do cliente Google
    callbackURL: "/api/auth/google/callback" // URL de callback após autenticação
}, async (accessToken, refreshToken, profile, done) => {
    try {
        // Procura usuário existente pelo email do Google
        let user = await User.findByEmail(profile.emails[0].value);

        // Se não existir usuário, cria um novo
        if (!user) {
            const userData = {
                name: profile.displayName,
                email: profile.emails[0].value,
                role: 'client', // Define papel como cliente
                status: 'active', // Define status como ativo
                google_id: profile.id // Salva ID do Google
            };

            user = await User.create(userData);
        }

        return done(null, user);
    } catch (error) {
        return done(error);
    }
}));

// Serialização do usuário para a sessão
passport.serializeUser((user, done) => {
    done(null, user.id);
});

// Deserialização do usuário da sessão
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error);
    }
});

// Exporta o passport configurado
module.exports = passport;