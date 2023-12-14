const db = require('../config/db');

async function queryAsync(sql, values) {
    return new Promise((resolve, reject) => {
        db.query(sql, values, (err, results) => {
            if (err) reject(err);
            else resolve(results);
        });
    });
}

async function getUserInfo(userId) {
    try {
        const sql = 'SELECT * FROM usuarios WHERE username = ?';
        const values = [userId];
        return await queryAsync(sql, values);
    } catch (error) {
        console.error('Error al obtener la información del usuario', error);
        throw error; 
    }
}

module.exports = {
    getUserInfo,
};
