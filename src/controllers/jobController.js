// File: src/controllers/jobController.js

const { Job, Company } = require('../models');

// Get all jobs
exports.getAllJobs = async (req, res) => {
  try {
    const jobs = await Job.findAll({
      include: [{
        model: Company,
        attributes: ['id', 'name']
      }]
    });
    
    res.status(200).json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a specific job by ID
exports.getJobById = async (req, res) => {
  try {
    const job = await Job.findByPk(req.params.id, {
      include: [{
        model: Company,
        attributes: ['id', 'name']
      }]
    });
    
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    
    res.status(200).json(job);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new job (recruiters only)
exports.createJob = async (req, res) => {
  try {
    // Only recruiters can create jobs, and they can only create jobs for their company
    const { title, description } = req.body;
    
    // Validate required fields
    if (!title || !description) {
      return res.status(400).json({ message: 'Title and description are required' });
    }
    
    // Create the job associated with the recruiter's company
    const job = await Job.create({
      title,
      description,
      companyId: req.user.companyId
    });
    
    res.status(201).json(job);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a job (recruiters only, and only for their company)
exports.updateJob = async (req, res) => {
  try {
    const job = await Job.findByPk(req.params.id);
    
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    
    // Check if the job belongs to the recruiter's company
    if (job.companyId !== req.user.companyId) {
      return res.status(403).json({ message: 'You can only update jobs from your company' });
    }
    
    // Update the job
    const { title, description, status } = req.body;
    job.title = title || job.title;
    job.description = description || job.description;
    job.status = status || job.status;
    
    await job.save();
    
    res.status(200).json(job);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a job (recruiters only, and only for their company)
exports.deleteJob = async (req, res) => {
  try {
    const job = await Job.findByPk(req.params.id);
    
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    
    // Check if the job belongs to the recruiter's company
    if (job.companyId !== req.user.companyId) {
      return res.status(403).json({ message: 'You can only delete jobs from your company' });
    }
    
    await job.destroy();
    
    res.status(200).json({ message: 'Job deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};