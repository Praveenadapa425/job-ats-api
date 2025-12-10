// File: src/routes/authRoutes.js

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Public route for user registration
// POST /api/auth/register
router.post('/register', authController.register);

// Public route for user login
// POST /api/auth/login
router.post('/login', authController.login);

module.exports = router;