// File: src/services/applicationService.js

const { Application, ApplicationHistory, User, Job, Company } = require('../models');
const { sendStageUpdateNotification } = require('./emailService');

// Define valid state transitions
const VALID_TRANSITIONS = {
  'Applied': ['Screening', 'Rejected'],
  'Screening': ['Interview', 'Rejected'],
  'Interview': ['Offer', 'Rejected'],
  'Offer': ['Hired', 'Rejected'],
  'Hired': [],
  'Rejected': []
};

/**
 * Validates if a stage transition is allowed
 * @param {string} currentStage - Current stage of the application
 * @param {string} newStage - Proposed new stage
 * @returns {boolean} - Whether the transition is valid
 */
const isValidTransition = (currentStage, newStage) => {
  // Rejected can be reached from any stage
  if (newStage === 'Rejected') {
    return true;
  }
  
  // Check if the new stage is in the list of valid transitions
  return VALID_TRANSITIONS[currentStage] && VALID_TRANSITIONS[currentStage].includes(newStage);
};

/**
 * Updates the stage of an application and creates a history record
 * @param {number} applicationId - ID of the application to update
 * @param {string} newStage - New stage to set
 * @param {number} changedById - ID of the user making the change
 * @returns {Object} - Updated application and created history record
 */
const updateApplicationStage = async (applicationId, newStage, changedById) => {
  // Fetch the application with associated data
  const application = await Application.findByPk(applicationId, {
    include: [
      {
        model: Job,
        include: [{
          model: Company
        }]
      },
      {
        model: User,
        as: 'candidate'
      }
    ]
  });
  
  if (!application) {
    throw new Error('Application not found');
  }
  
  // Validate the transition
  if (!isValidTransition(application.stage, newStage)) {
    throw new Error(`Invalid stage transition from ${application.stage} to ${newStage}`);
  }
  
  // Store the previous stage
  const previousStage = application.stage;
  
  // Update the application stage
  application.stage = newStage;
  await application.save();
  
  // Create a history record
  const historyRecord = await ApplicationHistory.create({
    applicationId,
    previousStage,
    newStage,
    changedById
  });
  
  // Send email notification to the candidate
  if (application.candidate && application.candidate.email) {
    await sendStageUpdateNotification(
      application.candidate.email,
      application.Job.title,
      newStage,
      application.Job.Company.name
    );
  }
  
  return { application, historyRecord };
};

/**
 * Gets all valid next stages for an application
 * @param {string} currentStage - Current stage of the application
 * @returns {Array} - Array of valid next stages
 */
const getValidNextStages = (currentStage) => {
  if (!VALID_TRANSITIONS[currentStage]) {
    return [];
  }
  
  // Return all valid transitions plus Rejected (which is always valid)
  // But don't add Rejected if it's already in the valid transitions
  const stages = [...VALID_TRANSITIONS[currentStage]];
  if (!stages.includes('Rejected')) {
    stages.push('Rejected');
  }
  return stages;
};

module.exports = {
  isValidTransition,
  updateApplicationStage,
  getValidNextStages
};