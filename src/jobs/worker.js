// File: src/jobs/worker.js

const { Worker } = require('bullmq');
const sgMail = require('@sendgrid/mail');
require('dotenv').config();

// Configure SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Create a worker to process email jobs
const emailWorker = new Worker('emailQueue', async job => {
  const { to, subject, text, html } = job.data;
  
  try {
    // Send the email using SendGrid
    await sgMail.send({
      to,
      from: process.env.SENDGRID_FROM_EMAIL || 'noreply@jobats.com',
      subject,
      text,
      html
    });
    
    console.log(`Email sent successfully to ${to}`);
  } catch (error) {
    console.error(`Failed to send email to ${to}:`, error);
    throw error;
  }
}, {
  connection: {
    url: process.env.REDIS_URL || 'redis://localhost:6379'
  }
});

// Event listeners for worker
emailWorker.on('completed', job => {
  console.log(`Job ${job.id} completed successfully`);
});

emailWorker.on('failed', (job, err) => {
  console.error(`Job ${job.id} failed with error:`, err);
});

console.log('Email worker is running...');

module.exports = { emailWorker };