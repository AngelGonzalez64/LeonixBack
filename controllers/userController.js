const { queryAsync } = require('../models/dbModel');
const fs = require('fs');

// Ruta para obtener la lista de géneros
async function getGeneros(req, res) {
  try {
    const results = await queryAsync('SELECT nombre FROM genero');
    res.status(200).json(results);
  } catch (err) {
    console.error('Error al obtener la lista de géneros:', err);
    res.status(500).json({ error: 'Error al obtener la lista de géneros' });
  }
}

// Ruta para obtener la información del usuario a partir del token
async function getUserInfo(req, res) {
  try {
    const userId = req.user.username;

    const userInfoQuery = `
    SELECT 
      u.id,
      u.username,
      u.email,
      u.nombre,
      u.apellidos,
      u.fecha_nacimiento,
      u.numero_telefono,
      u.imagen,
      g.nombre AS nombre_genero, 
      r.nombre AS nombre_rol 
    FROM 
      usuarios u 
      LEFT JOIN genero g ON u.genero_id = g.id 
      LEFT JOIN roles r ON u.rol_id = r.id 
    WHERE 
      u.username = ?`;

    const userInfoResults = await queryAsync(userInfoQuery, [userId]);

    if (userInfoResults.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const userInfo = userInfoResults[0];
    // Excluir la contraseña de los datos
    delete userInfo.password;

    res.status(200).json(userInfo);
  } catch (err) {
    console.error('Error al obtener la información del usuario:', err);
    res.status(500).json({ error: 'Error al obtener la información del usuario' });
  }
}

// Ruta para subir una imagen en base64
async function uploadImage(req, res) {
  try {
    const userId = req.user.username;
    const { imagenBase64 } = req.body;

    const userExists = await queryAsync('SELECT imagen FROM usuarios WHERE username = ?', [userId]);
    if (userExists.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Actualizar la información de la imagen en la base de datos
    await queryAsync('UPDATE usuarios SET imagen = ? WHERE username = ?', [imagenBase64, userId]);

    // Inside your try block
    if (!imagenBase64) {
      return res.status(400).json({ error: 'Invalid or missing image data' });
    }


    res.status(200).json({ message: 'Información de imagen guardada correctamente' });
  } catch (err) {
    console.error('Error al guardar la información de la imagen:', err);
    res.status(500).json({ error: 'Error al guardar la información de la imagen' });
  }
}


// Ruta para obtener la imagen de un usuario
async function getUserImage(req, res) {
  try {
    const userId = req.user.username;

    const userImageQuery = 'SELECT imagen FROM usuarios WHERE username = ?';
    const userImageResults = await queryAsync(userImageQuery, [userId]);

    if (userImageResults.length === 0 || !userImageResults[0].imagen) {
      return res.status(404).json({ error: 'Imagen no encontrada para el usuario' });
    }

    const imageBase64 = userImageResults[0].imagen;
    res.status(200).json({ imagen: imageBase64 });
  } catch (err) {
    console.error('Error al obtener la imagen del usuario:', err);
    res.status(500).json({ error: 'Error al obtener la imagen del usuario' });
  }
}

module.exports = {
  getGeneros,
  getUserInfo,
  uploadImage,
  getUserImage
};
