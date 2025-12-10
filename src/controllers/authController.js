// File: src/controllers/authController.js

const { User, Company } = require('../models'); // Import User and Company models
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// --- User Registration ---
exports.register = async (req, res) => {
  try {
    const { email, password, role, companyName } = req.body;

    // Basic validation
    if (!email || !password || !role) {
      return res.status(400).send({ message: "Email, password, and role are required." });
    }

    let user;
    // If the user is a recruiter or hiring manager, they must be associated with a company
    if (role === 'recruiter' || role === 'hiring_manager') {
      if (!companyName) {
        return res.status(400).send({ message: "Company name is required for recruiters and hiring managers." });
      }
      // Find or create the company
      const [company] = await Company.findOrCreate({
        where: { name: companyName },
      });
      user = await User.create({ email, password, role, companyId: company.id });
    } else {
      // Candidates are not associated with a company
      user = await User.create({ email, password, role });
    }
    
    // Do not send the user object back, especially not the password hash
    res.status(201).send({ message: "User registered successfully!" });

  } catch (error) {
    // Handle potential errors like a duplicate email
    res.status(500).send({ message: error.message || "An error occurred during registration." });
  }
};

// --- User Login ---
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).send({ message: "Email and password are required." });
    }

    // Find the user by their email
    const user = await User.findOne({ where: { email } });

    // Check if user exists and if the provided password matches the stored hash
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).send({ message: "Invalid email or password." });
    }

    // If credentials are valid, create a JWT (the user's "passport")
    const token = jwt.sign(
      { 
        id: user.id, 
        role: user.role, 
        companyId: user.companyId // Include companyId in the token for easy access
      },
      process.env.JWT_SECRET, // Use the secret key from your .env file
      { expiresIn: '24h' } // The token will expire in 24 hours
    );

    // Send the token back to the user
    res.status(200).send({ token });

  } catch (error) {
    res.status(500).send({ message: error.message || "An error occurred during login." });
  }
};