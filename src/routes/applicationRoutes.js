// File: src/routes/applicationRoutes.js

const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/applicationController');
const { authenticate, authorize } = require('../middleware/authMiddleware');

// All application routes require authentication
router.use(authenticate);

// POST /api/applications - Submit a new application (candidates only)
router.post('/', authorize(['candidate']), applicationController.submitApplication);

// GET /api/applications/:id - Get application details (candidates, recruiters, and hiring managers)
router.get('/:id', authorize(['candidate', 'recruiter', 'hiring_manager']), applicationController.getApplicationById);

// PUT /api/applications/:id/stage - Update application stage (recruiters only)
router.put('/:id/stage', authorize(['recruiter']), applicationController.updateApplicationStage);

// GET /api/applications - Get applications (candidates, recruiters, and hiring managers)
router.get('/', authorize(['candidate', 'recruiter', 'hiring_manager']), applicationController.getApplications);

module.exports = router;