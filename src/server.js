const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const PORT = process.env.PORT;

const authMiddleware = require('./middleware/auth');
const authRoutes = require('./routes/auth');
const animalRoutes = require('./routes/animals');

const app = express();

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, './public')));



app.use('/api', authRoutes);

app.use('/api/signin', authRoutes);
app.use('/api/animal', authMiddleware, animalRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`);
});
