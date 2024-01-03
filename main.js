const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const fs = require('fs');
const mysql = require('mysql2');

const app = express();
const PORT = 5000;

// Configuración de la base de datos
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'leonix_page'
};

const dbConnection = mysql.createConnection(dbConfig);

dbConnection.connect((err) => {
    if (err) {
        console.error('Error de conexión a la base de datos:', err.message);
        throw err;
    }
    console.log('Conexión a la base de datos establecida');
});

dbConnection.on('error', (err) => {
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
        console.error('Conexión a la base de datos perdida');
    } else {
        throw err;
    }
});

// Modelos
async function queryAsync(sql, values) {
    return new Promise((resolve, reject) => {
        dbConnection.query(sql, values, (err, results) => {
            if (err) reject(err);
            else resolve(results);
        });
    });
}

// Controladores
const JWT_SECRET_KEY = crypto.randomBytes(32).toString('hex');

function verifyToken(req, res, next) {
    const token = req.headers['authorization']?.split(' ')[1];

    console.log('Token recibido:', token);

    if (!token) {
        return res.status(403).json({ error: 'Token no proporcionado' });
    }

    jwt.verify(token, JWT_SECRET_KEY, (err, decoded) => {
        if (err) {
            console.error('Error al verificar el token:', err);
            return res.status(401).json({ error: 'Token no válido' });
        }

        req.user = decoded.user;
        next();
    });
}

// Ruta para iniciar sesión
async function login(req, res) {
    try {
        const { username, password } = req.body;

        const results = await queryAsync('SELECT username, password FROM usuarios WHERE username = ?', [username]);

        if (results.length === 0 || !await bcrypt.compare(password, results[0].password)) {
            return res.status(401).json({ error: 'Credenciales incorrectas' });
        }

        const user = { username: results[0].username };

        const token = jwt.sign({ user }, JWT_SECRET_KEY, { expiresIn: '1h' });
        console.log('Generated Token:', token);
        res.status(200).json({ token });
    } catch (err) {
        console.error('Error al buscar el usuario:', err);
        res.status(500).json({ error: 'Error al buscar el usuario' });
    }
}

// Ruta para registrar un nuevo usuario
async function signup(req, res) {
    try {
        const usuario = req.body;
        delete usuario.confirmPassword;

        const generoResults = await queryAsync('SELECT id FROM genero WHERE nombre = ?', [usuario.genero_id]);

        if (generoResults.length === 0) {
            return res.status(400).json({ error: 'Género no válido' });
        }

        usuario.genero_id = generoResults[0].id;

        // Hash de la contraseña
        const hashedPassword = await bcrypt.hash(usuario.password, 10);
        usuario.password = hashedPassword;

        const results = await queryAsync('INSERT INTO usuarios SET ?', usuario);

        console.log('Usuario registrado con éxito');
        res.status(201).json({ message: 'Usuario registrado con éxito' });
    } catch (err) {
        console.error('Error al registrar usuario:', err);
        res.status(500).json({ error: 'Error al registrar usuario' });
    }
}

async function uploadCVData(req, res) {
    try {
        const cvData = req.body;

        const results = await queryAsync('INSERT INTO cv SET ?', [cvData]);

        res.status(201).json({ message: 'CV data inserted successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Error inserting CV data' });
    }
}

async function getAllCVData(req, res) {
    try {
        const results = await queryAsync('SELECT * FROM cv');

        if (results.length > 0) {
            res.status(200).json(results);
        } else {
            res.status(404).json({ message: 'No CV data found' });
        }
    } catch (err) {
        console.error('Error retrieving CV data', err);
        res.status(500).json({ error: 'Error retrieving CV data' });
    }
}

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

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '100mb', extended: true }));

// Rutas
app.post('/login', login);
app.post('/signup', signup);
app.get('/get-generos', getGeneros);
app.get('/get-user-info', verifyToken, getUserInfo);
app.post('/upload-image', verifyToken, uploadImage);
app.get('/get-user-image', verifyToken, getUserImage);
app.post('/upload-cv', verifyToken, uploadCVData);
app.get('/get-cv-data', verifyToken, getAllCVData);

// Inicia el servidor
app.listen(PORT, () => {
    console.log(`Servidor en ejecución en http://localhost:${PORT}`);
});
