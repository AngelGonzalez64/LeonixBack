const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { getUserByUsername, insertUser } = require('../models/authModel');

const jwtSecretKey = crypto.randomBytes(32).toString('hex');

function generateToken(user) {
  return jwt.sign({ user }, jwtSecretKey, { expiresIn: '1h' });
}

async function login(req, res) {
  try {
    const { username, password } = req.body;
    const user = await getUserByUsername(username);

    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    const token = generateToken({ username: user.username });
    console.log('Generated Token:', token);
    res.status(200).json({ token });
  } catch (err) {
    console.error('Error al buscar el usuario:', err);
    res.status(500).json({ error: 'Error al buscar el usuario' });
  }
}

async function signup(req, res) {
  try {
    const usuario = req.body;
    delete usuario.confirmPassword;

    await insertUser(usuario);

    console.log('Usuario registrado con éxito');
    res.status(201).json({ message: 'Usuario registrado con éxito' });
  } catch (err) {
    console.error('Error al registrar usuario:', err);
    res.status(500).json({ error: err.message || 'Error al registrar usuario' });
  }
}

module.exports = {
  login,
  signup
};
