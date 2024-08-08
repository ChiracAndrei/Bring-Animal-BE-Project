const express = require('express');
const mysql = require('mysql2');
const multer = require('multer');
const path = require('path');
const fetch = require('node-fetch');
const fs = require('fs');
const router = express.Router();
const public = path.resolve(__dirname, '../public/images/');
const { z } = require('zod');

if (!fs.existsSync(public)) {
    fs.mkdirSync(public, { recursive: true });
}
const upload = multer({ dest: public });


const animalSchema = z.object({
    type: z.enum(['dog', 'cat', 'fish']),
    breed: z.string().min(1).optional(),
    image: z.string().optional(),
});

const postSchema = z.object({
    type: z.string().min(1),
    breed: z.string().min(1),
});


const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

router.get('/:animal', async (req, res) => {
    const { animal } = req.params;
    const { random, breed } = req.query;

    const validationResult = animalSchema.safeParse({ type: animal, breed: breed || ' ' });

    if (!validationResult.success) {
        return res.status(400).json({ status: 'fail', message: validationResult.error.errors });
    }
    if (animal === 'dog') {
        try {
            let url = 'https://dog.ceo/api/breeds/image/random';
            if (random !== '1' && breed !== ' ') {
                url = `https://dog.ceo/api/breed/${breed}/images/random`;
            }
            const response = await fetch(url);
            const data = await response.json();
            if (data.status === 'error') {
                return res.status(404).json({ status: 'fail', message: 'Breed not found' });
            }
            return res.json({
                status: 'success',
                data: {
                    animal,
                    breed: random === '1' ? 'random' : breed,
                    exampleImage: data.message,
                    source: 'dog.ceo',
                },
            });
        } catch (error) {
            return res.status(500).json({ status: 'fail', message: 'Server error' });
        }
    } else if (animal === 'cat' || animal === 'fish') {
        pool.query('SELECT * FROM animals WHERE type = ? AND (breed = ? OR ? = "1")', [animal, breed, random], (err, results) => {
            if (err) throw err;

            if (results.length === 0) {
                return res.status(404).json({ status: 'fail', message: 'Breed not found' });
            }

            const animalData = random === '1' ? results[Math.floor(Math.random() * results.length)] : results[0];

            res.json({
                status: 'success',
                data: {
                    animal: animalData.type,
                    breed: animalData.breed,
                    exampleImage: animalData.image,
                    source: 'own',
                },
            });
        });
    } else {
        res.status(400).json({ status: 'fail', message: 'Invalid animal type' });
    }
});

router.post('/', upload.single('image'), (req, res) => {
    const { type, breed } = req.body;
    const image = `/images/${req.file.filename}`;

    const validationResult = postSchema.safeParse({ type, breed });

    if (!validationResult.success) {
        return res.status(400).json({ status: 'fail', message: validationResult.error.errors });
    }
    pool.query('INSERT INTO animals (type, breed, image) VALUES (?, ?, ?)', [type, breed, image], (err, results) => {
        if (err) throw err;

        res.json({ status: 'success', message: 'Animal added successfully' });
    });
});

module.exports = router;
