// File: src/services/emailService.js

const { emailQueue } = require('../jobs/queue');

/**
 * Sends an email notification when a candidate applies for a job
 * @param {string} candidateEmail - Email of the candidate
 * @param {string} jobTitle - Title of the job applied for
 * @param {string} companyName - Name of the company offering the job
 */
const sendApplicationConfirmation = async (candidateEmail, jobTitle, companyName) => {
  const job = await emailQueue.add('applicationConfirmation', {
    to: candidateEmail,
    subject: `Application Received for ${jobTitle} at ${companyName}`,
    text: `Thank you for applying for the position of ${jobTitle} at ${companyName}. We have received your application and will review it shortly.`,
    html: `
      <h2>Application Received</h2>
      <p>Dear Candidate,</p>
      <p>Thank you for applying for the position of <strong>${jobTitle}</strong> at <strong>${companyName}</strong>.</p>
      <p>We have received your application and will review it shortly. You will be notified of any updates to your application status.</p>
      <p>Best regards,<br/>${companyName} Recruitment Team</p>
    `
  });
  
  console.log(`Application confirmation email job queued with ID: ${job.id}`);
};

/**
 * Sends an email notification to a recruiter when a new application is submitted
 * @param {string} recruiterEmail - Email of the recruiter
 * @param {string} candidateEmail - Email of the candidate
 * @param {string} jobTitle - Title of the job applied for
 */
const sendNewApplicationNotification = async (recruiterEmail, candidateEmail, jobTitle) => {
  const job = await emailQueue.add('newApplicationNotification', {
    to: recruiterEmail,
    subject: `New Application for ${jobTitle}`,
    text: `A new application has been submitted by ${candidateEmail} for the position of ${jobTitle}.`,
    html: `
      <h2>New Job Application</h2>
      <p>Hello Recruiter,</p>
      <p>A new application has been submitted by <strong>${candidateEmail}</strong> for the position of <strong>${jobTitle}</strong>.</p>
      <p>Please review the application in the system.</p>
      <p>Best regards,<br/>ATS System</p>
    `
  });
  
  console.log(`New application notification email job queued with ID: ${job.id}`);
};

/**
 * Sends an email notification when an application stage is updated
 * @param {string} userEmail - Email of the user to notify
 * @param {string} jobTitle - Title of the job
 * @param {string} newStage - New stage of the application
 * @param {string} companyName - Name of the company
 */
const sendStageUpdateNotification = async (userEmail, jobTitle, newStage, companyName) => {
  const job = await emailQueue.add('stageUpdateNotification', {
    to: userEmail,
    subject: `Application Status Update for ${jobTitle}`,
    text: `Your application for ${jobTitle} at ${companyName} has been updated to ${newStage}.`,
    html: `
      <h2>Application Status Update</h2>
      <p>Dear User,</p>
      <p>Your application for the position of <strong>${jobTitle}</strong> at <strong>${companyName}</strong> has been updated to <strong>${newStage}</strong>.</p>
      <p>If you have any questions, please contact the recruitment team.</p>
      <p>Best regards,<br/>${companyName} Recruitment Team</p>
    `
  });
  
  console.log(`Stage update notification email job queued with ID: ${job.id}`);
};

module.exports = {
  sendApplicationConfirmation,
  sendNewApplicationNotification,
  sendStageUpdateNotification
};