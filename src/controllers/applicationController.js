// File: src/controllers/applicationController.js

const { Application, Job, User, Company, ApplicationHistory } = require('../models');
const { updateApplicationStage } = require('../services/applicationService');
const { sendApplicationConfirmation, sendNewApplicationNotification } = require('../services/emailService');

// Submit a new application (candidates only)
exports.submitApplication = async (req, res) => {
  try {
    const { jobId } = req.body;
    
    // Validate required fields
    if (!jobId) {
      return res.status(400).json({ message: 'Job ID is required' });
    }
    
    // Check if the job exists and is open
    const job = await Job.findByPk(jobId, {
      include: [{
        model: Company
      }]
    });
    
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    
    if (job.status !== 'open') {
      return res.status(400).json({ message: 'This job is not open for applications' });
    }
    
    // Check if the candidate has already applied for this job
    const existingApplication = await Application.findOne({
      where: {
        jobId,
        candidateId: req.user.id
      }
    });
    
    if (existingApplication) {
      return res.status(400).json({ message: 'You have already applied for this job' });
    }
    
    // Create the application
    const application = await Application.create({
      jobId,
      candidateId: req.user.id,
      stage: 'Applied'
    });
    
    // Get the candidate's email
    const candidate = await User.findByPk(req.user.id);
    
    // Send email notifications
    if (candidate && candidate.email) {
      // Send confirmation to the candidate
      await sendApplicationConfirmation(
        candidate.email,
        job.title,
        job.Company.name
      );
      
      // Send notification to recruiters (simplified - in a real app, you might notify all recruiters for the company)
      // For now, we'll just log that this should happen
      console.log(`Should send notification to recruiters for job: ${job.title} at company: ${job.Company.name}`);
    }
    
    res.status(201).json(application);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get application details
exports.getApplicationById = async (req, res) => {
  try {
    const application = await Application.findByPk(req.params.id, {
      include: [
        {
          model: Job,
          include: [{
            model: Company,
            attributes: ['id', 'name']
          }]
        },
        {
          model: User,
          as: 'candidate',
          attributes: ['id', 'email']
        }
      ]
    });
    
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }
    
    // Authorization check
    // Candidates can only view their own applications
    // Recruiters and hiring managers can view applications for their company
    if (req.user.role === 'candidate' && application.candidateId !== req.user.id) {
      return res.status(403).json({ message: 'You can only view your own applications' });
    }
    
    if ((req.user.role === 'recruiter' || req.user.role === 'hiring_manager') && 
        application.Job.companyId !== req.user.companyId) {
      return res.status(403).json({ message: 'You can only view applications for your company' });
    }
    
    res.status(200).json(application);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update application stage (recruiters only)
exports.updateApplicationStage = async (req, res) => {
  try {
    const { newStage } = req.body;
    
    if (!newStage) {
      return res.status(400).json({ message: 'New stage is required' });
    }
    
    // Use the application service to update the stage
    const { application, historyRecord } = await updateApplicationStage(
      req.params.id,
      newStage,
      req.user.id
    );
    
    res.status(200).json({
      message: 'Application stage updated successfully',
      application,
      historyRecord
    });
  } catch (error) {
    if (error.message === 'Application not found') {
      return res.status(404).json({ message: error.message });
    }
    
    if (error.message.startsWith('Invalid stage transition')) {
      return res.status(400).json({ message: error.message });
    }
    
    res.status(500).json({ message: error.message });
  }
};

// Get applications with filtering
exports.getApplications = async (req, res) => {
  try {
    const { stage, jobId } = req.query;
    const whereConditions = {};
    
    // Build where conditions based on query parameters
    if (stage) {
      whereConditions.stage = stage;
    }
    
    // Role-based filtering
    if (req.user.role === 'candidate') {
      // Candidates can only see their own applications
      whereConditions.candidateId = req.user.id;
    } else if (req.user.role === 'recruiter' || req.user.role === 'hiring_manager') {
      // Recruiters and hiring managers can see applications for jobs in their company
      // We'll filter by companyId in the include clause
    }
    
    // Additional filtering by jobId if provided
    if (jobId) {
      whereConditions.jobId = jobId;
    }
    
    const includeOptions = [
      {
        model: Job,
        include: [{
          model: Company,
          attributes: ['id', 'name']
        }]
      },
      {
        model: User,
        as: 'candidate',
        attributes: ['id', 'email']
      }
    ];
    
    // For recruiters and hiring managers, filter by company
    if (req.user.role === 'recruiter' || req.user.role === 'hiring_manager') {
      includeOptions[0].where = { companyId: req.user.companyId };
    }
    
    const applications = await Application.findAll({
      where: whereConditions,
      include: includeOptions,
      order: [['createdAt', 'DESC']]
    });
    
    res.status(200).json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};