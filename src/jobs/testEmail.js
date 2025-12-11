// File: src/jobs/testEmail.js

const { emailQueue } = require('./queue');

async function testEmailQueue() {
  try {
    // Add a test email job to the queue
    const job = await emailQueue.add('testEmail', {
      to: 'test@example.com',
      subject: 'Test Email from ATS System',
      text: 'This is a test email sent from the Job ATS system.',
      html: '<h1>Test Email</h1><p>This is a test email sent from the Job ATS system.</p>'
    });
    
    console.log(`Test email job queued with ID: ${job.id}`);
  } catch (error) {
    console.error('Failed to queue test email:', error);
  }
}

// Run the test
testEmailQueue();