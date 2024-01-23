const { queryAsync } = require('../models/dbModel');

// No buscar directamente el ID del fregado usuario porque al baboso que hizo esto no lo añadio al token >:c

// Ruta para registrar un nuevo CV
async function addCV(req, res) {
  const { username } = req.user; // Obtén el username del token

  console.log('Username:', username);

  // Busca el usuario en la base de datos para obtener el usuario_id
  const userQuery = await queryAsync('SELECT id FROM usuarios WHERE username = ?', [username]);

  if (userQuery.length === 0) {
    return res.status(404).json({ error: 'Usuario no encontrado' });
  }

  const usuario_id = userQuery[0].id;

  const cvData = req.body;
  cvData.usuario_id = usuario_id; // Asigna el usuario_id al objeto de datos del CV

  const results = await queryAsync('INSERT INTO cv SET ?', cvData);

  console.log('CV registrado con éxito');
  res.status(201).json({ message: 'CV registrado con éxito' });
}

// Ruta para actualizar el CV
async function updateCV(req, res) {
  const { username } = req.user;

  console.log('Username:', username);

  const userQuery = await queryAsync('SELECT id FROM usuarios WHERE username = ?', [username]);

  if (userQuery.length === 0) {
    return res.status(404).json({ error: 'Usuario no encontrado' });
  }

  const usuario_id = userQuery[0].id;

  const cvData = req.body;
  cvData.usuario_id = usuario_id;

  // Verifica si ya existe información del usuario en la tabla cv
  const existingCVQuery = await queryAsync('SELECT id FROM cv WHERE usuario_id = ?', [usuario_id]);

  if (existingCVQuery.length > 0) {
    // Si ya existe información, actualiza el registro existente
    const cvUpdateResult = await queryAsync('UPDATE cv SET ? WHERE usuario_id = ?', [cvData, usuario_id]);

    console.log('CV actualizado con éxito');
    res.status(200).json({ message: 'CV actualizado con éxito' });
  } else {
    // Si no existe información, inserta un nuevo registro en la tabla cv
    const cvInsertResult = await queryAsync('INSERT INTO cv SET ?', cvData);

    console.log('CV registrado con éxito');
    res.status(201).json({ message: 'CV registrado con éxito' });
  }
}

async function getAllCVData(req, res) {
  const results = await queryAsync('SELECT * FROM cv');

  if (results.length > 0) {
    console.log('CV data retrieved successfully');
    res.status(200).json(results);
  } else {
    console.error('No CV data found');
    res.status(404).json({ message: 'No CV data found' });
  }
}

module.exports = {
  addCV,
  updateCV,
  getAllCVData,
};
