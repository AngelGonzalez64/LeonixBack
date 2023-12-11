const mysql = require('mysql');

// Configura la conexión a la base de datos
const dbConfig = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'leonix_page'
});

dbConfig.connect((err) => {
  if (err) {
    console.error('Error de conexión a la base de datos: ',err); // Imprime en rojo
    return;
  }
  console.log('Conexión a la base de datos establecida'); // Imprime en verde
});

module.exports = dbConfig;
