const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2');
const router = express.Router();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

const generateAccessToken = (user) => {
    return jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRATION });
};

const generateRefreshToken = (user) => {
    const refreshToken = jwt.sign({ id: user.id }, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.REFRESH_TOKEN_EXPIRATION });
    pool.query('INSERT INTO refresh_tokens (user_id, token) VALUES (?, ?)', [user.id, refreshToken]);
    return refreshToken;
};

router.post('/', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }
    pool.query('SELECT * FROM users WHERE username = ?', [username], (err, results) => {
        if (err) throw err;

        if (results.length === 0) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        const user = results[0];

        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) throw err;

            if (!isMatch) {
                return res.status(401).json({ message: 'Invalid username or password' });
            }

            const accessToken = generateAccessToken(user);
            const refreshToken = generateRefreshToken(user);

            res.json({ accessToken, refreshToken });
        });
    });
});

router.post('/token', (req, res) => {
    const { token } = req.body;

    if (!token) {
        return res.sendStatus(401);
    }

    pool.query('SELECT * FROM refresh_tokens WHERE token = ?', [token], (err, results) => {
        if (err) throw err;

        if (results.length === 0) {
            return res.sendStatus(403);
        }

        jwt.verify(token, process.env.JWT_REFRESH_SECRET, (err, user) => {
            if (err) {
                return res.sendStatus(403);
            }

            const accessToken = generateAccessToken(user);
            res.json({ accessToken });
        });
    });
});


router.post('/register', (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ message: 'Username, email, and password are required' });
    }


    pool.query('SELECT * FROM users WHERE username = ? OR email = ?', [username, email], (err, results) => {
        if (err) throw err;

        if (results.length > 0) {
            return res.status(400).json({ message: 'Username or email already in use' });
        }

        bcrypt.hash(password, 10, (err, hashedPassword) => {
            if (err) throw err;

            pool.query(
                'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
                [username, email, hashedPassword],
                (err, results) => {
                    if (err) throw err;
                    res.status(201).json({ message: 'User registered successfully' });
                }
            );
        });
    });
});

module.exports = router;
