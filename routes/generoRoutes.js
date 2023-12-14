const express = require('express');
const { getGenerosController } = require('../controllers/generoController');

const router = express.Router();

router.get('/get-generos', getGenerosController);

module.exports = router;
