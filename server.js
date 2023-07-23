const express = require('express');
const bodyParser = require('body-parser');
const chatAI = require('./libs/chatAI');
const jwt = require('jsonwebtoken');
const chalk = require('chalk');

const app = express();
app.use(bodyParser.json());

// Secret key untuk JWT, bisa diganti dengan nilai yang lebih aman
const secretKey = 'rahasia';
const refreshTokenSecretKey = 'refreshrahasia'; // Secret key untuk refresh token

// Data statik pengguna
const users = [
    {
        id: 1,
        username: 'user1',
        password: 'password1' // Ganti dengan password yang lebih aman
    }
    // Tambahkan pengguna lain jika diperlukan
];

// Fungsi untuk mendapatkan pengguna berdasarkan username dan password
function getUserByUsernameAndPassword(username, password) {
    return users.find(user => user.username === username && user.password === password);
}

// Fungsi untuk membuat token JWT
function generateAccessToken(user) {
    return jwt.sign(user, secretKey, { expiresIn: '15m' }); // Token akan expired dalam 15 menit
}

// Fungsi untuk membuat refresh token
function generateRefreshToken(user) {
    return jwt.sign(user, refreshTokenSecretKey); // Refresh token tidak memiliki expired time
}

// Endpoint untuk mendapatkan token JWT dan refresh token berdasarkan username dan password
app.post('/api/token', (req, res) => {
    const { username, password } = req.body;

    // Validasi input username dan password
    if (!username || !password) {
        console.error(chalk.cyan('[APP CHAT-AI]:'), chalk.red('Username dan password harus diisi!'));
        return res.status(400).json({ error: 'Username dan password harus diisi!' });
    }

    // Cari pengguna berdasarkan username dan password
    const user = getUserByUsernameAndPassword(username, password);

    if (!user) {
        console.error(chalk.cyan('[APP CHAT-AI]:'), chalk.red('Username atau password salah!'));
        return res.status(401).json({ error: 'Username atau password salah!' });
    }

    // Buat token JWT dan refresh token
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    
    // Tambahkan expired time pada response
    const expiresIn = jwt.decode(accessToken).exp;
    console.log(chalk.cyan('[APP CHAT-AI]:'), chalk.green('Buat token JWT dan refresh token...'));
    res.json({ accessToken, refreshToken, expiresIn });
});

// Fungsi untuk melakukan autentikasi token JWT
function authenticateToken(req, res, next) {
    const authHeader = req.header('Authorization');
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Token tidak ditemukan!' });
    }

    jwt.verify(token, secretKey, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Token tidak valid!' });
        }
        req.user = user;
        next();
    });
}

// Route untuk chat AI dengan autentikasi
app.post('/api/chat', authenticateToken, async (req, res) => {
    const question = req.body.question;

    // Melakukan prediksi dengan chat AI
    const answer = await chatAI.getAnswer(question);

    res.json({ answer });
});

const port = 3000;
app.listen(port, () => {
    console.log(chalk.cyan('[APP CHAT-AI]:'), chalk.yellow('Server API berjalan di http://localhost:3000'));
});
