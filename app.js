const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const authController = require('./controllers/authController');
const userController = require('./controllers/userController');
const cvController = require('./controllers/cvController');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '100mb', extended: true }));

// RUTAS
// Auth
app.post('/login', authController.login);
app.post('/signup', authController.signup);

// User
app.get('/get-generos', userController.getGeneros);
app.get('/get-user-info', authController.verifyToken, userController.getUserInfo);
app.post('/upload-image', authController.verifyToken, userController.uploadImage);
app.get('/get-user-image', authController.verifyToken, userController.getUserImage);

// CV
app.post('/postCV', authController.verifyToken, cvController.addCV);
app.put('/updateCV', authController.verifyToken, cvController.updateCV);
app.get('/getCV', authController.verifyToken, cvController.getAllCVData);

// Inicia el servidor
app.listen(PORT, () => {
  console.log(`Servidor en ejecución en http://localhost:${PORT}`);
});
