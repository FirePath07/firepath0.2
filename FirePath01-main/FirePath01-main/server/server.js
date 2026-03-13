
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config({ path: './.env' });

const port = process.env.PORT || 5000;
const app = express();

app.use(cors());
app.use(express.json());

// Mount routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/feedback', require('./routes/feedback'));

// Connect to MongoDB Atlas and start server
const ATLAS_URI = process.env.ATLAS_URI;

if (!ATLAS_URI) {
    console.error('ATLAS_URI is not defined in .env');
    process.exit(1);
}

mongoose.connect(ATLAS_URI)
    .then(() => {
        console.log('Successfully connected to MongoDB Atlas.');
        app.listen(port, () => {
            console.log(`Server is running on port: ${port}`);
        });
    })
    .catch(err => {
        console.error('MongoDB connection error:', err.message);
        process.exit(1);
    });
