const express = require('express');
const { getUserInfoController } = require('../controllers/userController');

const router = express.Router();

router.get('/get-user-info', getUserInfoController);

module.exports = router;