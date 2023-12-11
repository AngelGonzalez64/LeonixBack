const { getGeneros } = require('../models/userModel');

async function getGeneros(req, res) {
  try {
    const results = await getGeneros();
    res.status(200).json(results);
  } catch (err) {
    console.error('Error al obtener la lista de géneros:', err);
    res.status(500).json({ error: 'Error al obtener la lista de géneros' });
  }
}

module.exports = {
  getGeneros
};
