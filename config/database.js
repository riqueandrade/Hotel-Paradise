// Importa as dependências necessárias
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const fs = require('fs').promises;
const path = require('path');

// Carrega as variáveis de ambiente
dotenv.config();

// Cria um pool de conexões com o banco de dados
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Função para conectar ao banco de dados
const connectDB = async () => {
    try {
        const connection = await pool.getConnection();
        console.log('Banco de dados conectado');
        
        // Inicializa as tabelas
        await initializeTables();
        
        connection.release();
    } catch (error) {
        console.error('Erro ao conectar ao banco de dados:', error);
        process.exit(1);
    }
};

// Função para inicializar as tabelas do banco
const initializeTables = async () => {
    try {
        // Verifica se a tabela rooms já existe
        const [tables] = await pool.query(
            "SHOW TABLES LIKE 'rooms'"
        );

        // Se a tabela não existir, cria todas as tabelas necessárias
        if (tables.length === 0) {
            // Lê o arquivo SQL com os comandos de criação
            const roomsSQL = await fs.readFile(
                path.join(__dirname, '..', 'database', 'rooms.sql'), 
                'utf8'
            );
            
            // Divide o arquivo em comandos individuais
            const commands = roomsSQL.split(';').filter(cmd => cmd.trim());
            
            // Executa cada comando separadamente
            for (const command of commands) {
                if (command.trim()) {
                    await query(command);
                }
            }
        }
    } catch (error) {
        console.error('Erro ao inicializar tabelas:', error);
        throw error;
    }
};

// Adiciona handler para erros de conexão
pool.on('error', (err) => {
    console.error('Erro na conexão com o banco:', err);
});

// Função auxiliar para executar queries no banco
const query = async (sql, params) => {
    try {
        const [results] = await pool.execute(sql, params);
        return results;
    } catch (error) {
        console.error('Erro na query:', error);
        throw new Error(`Database query failed: ${error.message}`);
    }
};

// Função para testar a conexão com o banco
const testConnection = async () => {
    try {
        const connection = await pool.getConnection();
        connection.release();
    } catch (error) {
        console.error('Erro ao testar conexão:', error);
        throw error;
    }
};

// Inicia a conexão com o banco de dados
connectDB().catch(error => {
    console.error('Falha ao inicializar banco:', error);
});

// Exporta as funções e objetos necessários
module.exports = { pool, connectDB, query };