const db = require('../config/db');

async function queryAsync(sql, values) {
  return new Promise((resolve, reject) => {
    db.query(sql, values, (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
}


async function getGeneros() {
    const results = await queryAsync('SELECT * FROM genero');
    return results;
  }

module.exports = {
  getGeneros
};