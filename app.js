const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const generoRoutes = require('./routes/generoRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();
const port = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Rutas
app.use('/', authRoutes);
app.use('/', generoRoutes);
app.use('/', userRoutes);

// Inicia el servidor
app.listen(port, () => {
  console.log(`Servidor en ejecución en http://localhost:${port}`);
});
