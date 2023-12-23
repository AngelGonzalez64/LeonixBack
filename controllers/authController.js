const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const db = require('../config/db');
const { queryAsync } = require('../models/dbModel');

const JWT_SECRET_KEY = crypto.randomBytes(32).toString('hex');

// Verificar y decodificar el token
function verifyToken(req, res, next) {
  const token = req.headers['authorization'].split(' ')[1];

  console.log('Token recibido:', token);

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

// Ruta para iniciar sesión
async function login(req, res) {
  try {
    const { username, password } = req.body;

    const results = await queryAsync('SELECT username, password FROM usuarios WHERE username = ?', [username]);

    if (results.length === 0 || !await bcrypt.compare(password, results[0].password)) {
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
}

// Ruta para registrar un nuevo usuario
async function signup(req, res) {
  try {
    const usuario = req.body;
    delete usuario.confirmPassword;

    const generoResults = await queryAsync('SELECT id FROM genero WHERE nombre = ?', [usuario.genero_id]);

    if (generoResults.length === 0) {
      return res.status(400).json({ error: 'Género no válido' });
    }

    usuario.genero_id = generoResults[0].id;

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(usuario.password, 10);
    usuario.password = hashedPassword;

    const results = await queryAsync('INSERT INTO usuarios SET ?', usuario);

    console.log('Usuario registrado con éxito');
    res.status(201).json({ message: 'Usuario registrado con éxito' });
  } catch (err) {
    console.error('Error al registrar usuario:', err);
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
}

module.exports = {
  verifyToken,
  login,
  signup
};
