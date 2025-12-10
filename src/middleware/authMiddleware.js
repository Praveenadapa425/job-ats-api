// File: src/middleware/authMiddleware.js

const jwt = require('jsonwebtoken');

// Middleware to verify the token (Authentication)
const authenticate = (req, res, next) => {
  // Get the token from the Authorization header (e.g., "Bearer <token>")
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authentication required. No token provided.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Verify the token using the secret key
    const decodedPayload = jwt.verify(token, process.env.JWT_SECRET);

    // Attach the decoded user information to the request object
    // so that subsequent controllers can access it
    req.user = decodedPayload; // e.g., req.user = { id: 1, role: 'recruiter', companyId: 5 }
    
    next(); // The user is authenticated, proceed to the next middleware or controller
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
};

// Middleware factory to check for specific roles (Authorization)
const authorize = (roles = []) => {
  // This returns another middleware function
  return (req, res, next) => {
    // We assume the `authenticate` middleware has already run
    // and attached the user payload to req.user
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden. You do not have the necessary permissions.' });
    }
    
    next(); // The user has the required role, proceed.
  };
};

module.exports = {
  authenticate,
  authorize,
};