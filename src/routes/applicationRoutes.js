// File: src/routes/applicationRoutes.js

const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/applicationController');
const { authenticate, authorize } = require('../middleware/authMiddleware');

// All application routes require authentication
router.use(authenticate);

// POST /api/applications - Submit a new application (candidates only)
router.post('/', authorize(['candidate']), applicationController.submitApplication);

// GET /api/applications/:id - Get application details (candidate, recruiter, hiring manager)
router.get('/:id', applicationController.getApplicationById);

// PUT /api/applications/:id/stage - Update application stage (recruiters only)
router.put('/:id/stage', authorize(['recruiter']), applicationController.updateApplicationStage);

// GET /api/applications - Get applications (with filtering by stage)
router.get('/', applicationController.getApplications);

module.exports = router;