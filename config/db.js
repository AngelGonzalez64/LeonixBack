const mysql = require('mysql2');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'leonix_page'
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
