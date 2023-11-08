const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const cors = require('cors');
const colors = require('colors');
const db = require('./config');

const app = express();
const port = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Ruta para iniciar sesión
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  db.query('SELECT * FROM usuarios WHERE username = ?', [username], (err, results) => {
    if (err) {
      console.error('Error al buscar el usuario:', err.red);
      return res.status(500).json({ error: 'Error al buscar el usuario' });
    }

    if (results.length === 0 || results[0].password !== password) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    res.status(200).json({ message: 'Inicio de sesión exitoso' });
  });
});

// Ruta para registrar un nuevo usuario
app.post('/signup', (req, res) => {
  const usuario = req.body;
  delete usuario.confirmPassword;

  db.query('INSERT INTO usuarios SET ?', usuario, (err, results) => {
    if (err) {
      console.error('Error al registrar usuario:', err.red);
      return res.status(500).json({ error: 'Error al registrar usuario' });
    }

    console.log('Usuario registrado con éxito'.green);
    res.status(201).json({ message: 'Usuario registrado con éxito' });
  });
});

// Inicia el servidor
app.listen(port, () => {
  console.log(`Servidor en ejecución en http://localhost:${port}`.magenta);
});
