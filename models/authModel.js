const db = require('../config/db');

async function queryAsync(sql, values) {
  return new Promise((resolve, reject) => {
    db.query(sql, values, (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
}

async function getUserByUsername(username) {
  const results = await queryAsync('SELECT * FROM usuarios WHERE username = ?', [username]);
  return results.length > 0 ? results[0] : null;
}

async function insertUser(usuario) {
  const generoResults = await queryAsync('SELECT id FROM genero WHERE nombre = ?', [usuario.genero_id]);

  if (generoResults.length === 0) {
    throw new Error('Género no válido');
  }

  usuario.genero_id = generoResults[0].id;

  const results = await queryAsync('INSERT INTO usuarios SET ?', usuario);
  return results;
}

module.exports = {
  getUserByUsername,
  insertUser
};
