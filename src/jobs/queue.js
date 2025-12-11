// File: src/jobs/queue.js

const { Queue } = require('bullmq');
require('dotenv').config();

// Create a new queue for email notifications
const emailQueue = new Queue('emailQueue', {
  connection: {
    url: process.env.REDIS_URL || 'redis://localhost:6379'
  }
});

module.exports = { emailQueue };