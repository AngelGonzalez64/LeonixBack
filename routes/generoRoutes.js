const express = require('express');
const { getGeneros } = require('../controllers/generoController');

const router = express.Router();

router.get('/get-generos', getGeneros);

module.exports = router;
