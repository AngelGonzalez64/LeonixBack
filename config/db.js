require('dotenv').config();

const mysql = require('mysql2');

// Crea tu archivo .env

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE
};

const dbConnection = mysql.createConnection(dbConfig);

dbConnection.connect((err) => {
  if (err) {
    console.error('Error de conexión a la base de datos:', err.message);
    throw err;
  }
  console.log('Conexión a la base de datos establecida');
});

dbConnection.on('error', (err) => {
  if (err.code === 'PROTOCOL_CONNECTION_LOST') {
    console.error('Conexión a la base de datos perdida');
  } else {
    throw err;
  }
});

module.exports = dbConnection;
