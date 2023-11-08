const mysql = require('mysql');

// Configura la conexión a la base de datos
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'leonix_page'
});

db.connect((err) => {
  if (err) {
    console.error('Error de conexión a la base de datos: '.red + err.red); // Imprime en rojo
    return;
  }
  console.log('Conexión a la base de datos establecida'.green); // Imprime en verde
});

module.exports = db;
