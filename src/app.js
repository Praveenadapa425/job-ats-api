// File: src/app.js

const express = require('express');
const app = express();

// Import the routes
const authRoutes = require('./routes/authRoutes');
const jobRoutes = require('./routes/jobRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const healthRoutes = require('./routes/healthRoutes');

app.use(express.json());

app.get('/', (req, res) => {
  res.status(200).send('API is running!');
});

// Health check endpoint
app.use('/api/health', healthRoutes);

// Tell the app to use the routes
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);

module.exports = app;