// const mysql = require('mysql2/promise');

// const dbConfig = {
//     host: "localhost",
//     user: "root",
//     password: "",
//     database: "paeeja",
//     multipleStatements: true
// };

// const pool = mysql.createPool(dbConfig);

// module.exports = pool;

// db.js (ou o nome do seu arquivo de conexão)
require('dotenv').config(); // Carrega variáveis locais se existirem
const { Pool } = require('pg');

const pool = new Pool({
  // AQUI ESTÁ O SEGREDO:
  // Em vez de escrever o endereço, mandamos o Node procurar uma variável chamada DATABASE_URL
  connectionString: process.env.DATABASE_URL,
  
  // Configuração obrigatória para o Render (SSL)
  ssl: {
    rejectUnauthorized: false
  }
});

module.exports = pool;