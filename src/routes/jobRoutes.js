// File: src/routes/jobRoutes.js

const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');
const { authenticate, authorize } = require('../middleware/authMiddleware');

// All job routes require authentication
router.use(authenticate);

// GET /api/jobs - Get all jobs (public access in README, but let's make it accessible to all authenticated users)
router.get('/', jobController.getAllJobs);

// GET /api/jobs/:id - Get a specific job (public access in README, but let's make it accessible to all authenticated users)
router.get('/:id', jobController.getJobById);

// POST /api/jobs - Create a new job (recruiters only)
router.post('/', authorize(['recruiter']), jobController.createJob);

// PUT /api/jobs/:id - Update a job (recruiters only, and only for their company)
router.put('/:id', authorize(['recruiter']), jobController.updateJob);

// DELETE /api/jobs/:id - Delete a job (recruiters only, and only for their company)
router.delete('/:id', authorize(['recruiter']), jobController.deleteJob);

module.exports = router;