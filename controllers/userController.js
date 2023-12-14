const { getUserInfo } = require('../models/userModel');

async function getUserInfoController(req, res, next) {
    try {
        if (!req.user || !req.user.username) {
            return res.status(401).json({ error: 'Usuario no autenticado' });
        }

        const userId = req.user.username;
        const userInfoResults = await getUserInfo(userId);

        if (userInfoResults.length === 0) {
            return res.status(404).json({ error: 'No se encontró el usuario' });
        }

        res.status(200).json(userInfoResults[0]);
    } catch (error) {
        console.error('Error al obtener la información del usuario', error);
        next(error); // Pasa el error al siguiente middleware (manejador de errores)
    }
}

module.exports = {
    getUserInfoController
};
