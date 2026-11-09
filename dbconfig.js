// Configuração da conexão com o SQL Server Express.
const config = {
    server: process.env.DB_SERVER || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 59234,
    user: process.env.DB_USER || 'gabriel',
    password: process.env.DB_PASSWORD || 'teste123',
    database: process.env.DB_NAME || 'Lojas',
    options: {
        encrypt: false,
        trustServerCertificate: true
    }
};

module.exports = config;
