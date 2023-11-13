const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const colors = require('colors');

const db = require('./config');

const app = express();
const port = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Genera una clave secreta para JWT
const jwtSecretKey = crypto.randomBytes(32).toString('hex');

// Ruta para iniciar sesión
app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    const results = await queryAsync('SELECT * FROM usuarios WHERE username = ?', [username]);

    if (results.length === 0 || results[0].password !== password) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    const user = {
      username: results[0].username,
      // Otros datos del usuario si es necesario
    };

    const token = jwt.sign({ user }, jwtSecretKey, { expiresIn: '1h' });

    res.status(200).json({ token });
  } catch (err) {
    console.error('Error al buscar el usuario:', err.red);
    res.status(500).json({ error: 'Error al buscar el usuario' });
  }
});

// Ruta para registrar un nuevo usuario
app.post('/signup', async (req, res) => {
  try {
    const usuario = req.body;
    delete usuario.confirmPassword;

    const results = await queryAsync('INSERT INTO usuarios SET ?', usuario);

    console.log('Usuario registrado con éxito'.green);
    res.status(201).json({ message: 'Usuario registrado con éxito' });
  } catch (err) {
    console.error('Error al registrar usuario:', err.red);
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
});

// Función para ejecutar consultas a la base de datos de manera asíncrona
function queryAsync(sql, values) {
  return new Promise((resolve, reject) => {
    db.query(sql, values, (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
}

// Ruta para obtener datos de usuario por token
app.get('/get-user-by-token', async (req, res) => {
  const token = req.header('Authorization');

  if (!token) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  try {
    // Verifica el token
    const decoded = jwt.verify(token, jwtSecretKey);

    // Extrae el usuario del token
    const { user } = decoded;

    // Obtén todos los datos del usuario
    const results = await queryAsync('SELECT * FROM usuarios WHERE username = ?', [user.username]);

    if (results.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const userData = results[0];
    res.status(200).json(userData);
  } catch (err) {
    console.error('Error al obtener datos de usuario:', err.red);
    res.status(401).json({ error: 'Token inválido' });
  }
});

// Inicia el servidor
app.listen(port, () => {
  console.log(`Servidor en ejecución en http://localhost:${port}`.magenta);
});
