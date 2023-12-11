const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const db = require('./config/db');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

const JWT_SECRET_KEY = crypto.randomBytes(32).toString('hex');

// Middleware para verificar y decodificar el token
function verifyToken(req, res, next) {
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(403).json({ error: 'Token no proporcionado' });
  }

  jwt.verify(token, JWT_SECRET_KEY, (err, decoded) => {
    if (err) {
      console.error('Error al verificar el token:', err);
      return res.status(401).json({ error: 'Token no válido' });
    }

    req.user = decoded.user;
    next();
  });
}

// Función para ejecutar consultas a la base de datos de manera asíncrona
async function queryAsync(sql, values) {
  return new Promise((resolve, reject) => {
    db.query(sql, values, (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
}

// Ruta para iniciar sesión
app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    const results = await queryAsync('SELECT * FROM usuarios WHERE username = ?', [username]);

    if (results.length === 0 || results[0].password !== password) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    const user = { username: results[0].username };

    const token = jwt.sign({ user }, JWT_SECRET_KEY, { expiresIn: '1h' });
    console.log('Generated Token:', token);
    res.status(200).json({ token });
  } catch (err) {
    console.error('Error al buscar el usuario:', err);
    res.status(500).json({ error: 'Error al buscar el usuario' });
  }
});

// Ruta para registrar un nuevo usuario
app.post('/signup', async (req, res) => {
  try {
    const usuario = req.body;
    delete usuario.confirmPassword;

    const generoResults = await queryAsync('SELECT id FROM genero WHERE nombre = ?', [usuario.genero_id]);

    if (generoResults.length === 0) {
      return res.status(400).json({ error: 'Género no válido' });
    }

    usuario.genero_id = generoResults[0].id;

    const results = await queryAsync('INSERT INTO usuarios SET ?', usuario);

    console.log('Usuario registrado con éxito');
    res.status(201).json({ message: 'Usuario registrado con éxito' });
  } catch (err) {
    console.error('Error al registrar usuario:', err);
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
});

// Ruta para obtener la lista de géneros
app.get('/get-generos', async (req, res) => {
  try {
    const results = await queryAsync('SELECT * FROM genero');
    res.status(200).json(results);
  } catch (err) {
    console.error('Error al obtener la lista de géneros:', err);
    res.status(500).json({ error: 'Error al obtener la lista de géneros' });
  }
});

// Inicia el servidor
app.listen(PORT, () => {
  console.log(`Servidor en ejecución en http://localhost:${PORT}`);
});
