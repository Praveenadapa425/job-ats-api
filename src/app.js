// File: src/app.js

const express = require('express');
const app = express();

// Import the authentication routes
const authRoutes = require('./routes/authRoutes');

app.use(express.json());

app.get('/', (req, res) => {
  res.status(200).send('API is running!');
});

// Tell the app to use the auth routes for any request starting with /api/auth
app.use('/api/auth', authRoutes);

module.exports = app;