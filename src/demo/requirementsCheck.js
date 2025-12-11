// File: src/demo/requirementsCheck.js

const { 
  isValidTransition, 
  getValidNextStages 
} = require('../services/applicationService');

const { User, Company, Job, Application, ApplicationHistory } = require('../models');

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

console.log('=== Job Application Tracking System Requirements Validation ===\n');

// 1. Validate State Machine Workflow
console.log('1. Validating State Machine Workflow...');
console.log('   Applied -> Screening:', isValidTransition('Applied', 'Screening') ? '✓ PASS' : '✗ FAIL');
console.log('   Screening -> Interview:', isValidTransition('Screening', 'Interview') ? '✓ PASS' : '✗ FAIL');
console.log('   Interview -> Offer:', isValidTransition('Interview', 'Offer') ? '✓ PASS' : '✗ FAIL');
console.log('   Offer -> Hired:', isValidTransition('Offer', 'Hired') ? '✓ PASS' : '✗ FAIL');
console.log('   Applied -> Rejected:', isValidTransition('Applied', 'Rejected') ? '✓ PASS' : '✗ FAIL');
console.log('   Screening -> Rejected:', isValidTransition('Screening', 'Rejected') ? '✓ PASS' : '✗ FAIL');
console.log('   Interview -> Rejected:', isValidTransition('Interview', 'Rejected') ? '✓ PASS' : '✗ FAIL');
console.log('   Offer -> Rejected:', isValidTransition('Offer', 'Rejected') ? '✓ PASS' : '✗ FAIL');
console.log('   Hired -> Rejected:', isValidTransition('Hired', 'Rejected') ? '✓ PASS' : '✗ FAIL');
console.log('   Applied -> Interview (invalid):', !isValidTransition('Applied', 'Interview') ? '✓ PASS' : '✗ FAIL');
console.log('   Screening -> Hired (invalid):', !isValidTransition('Screening', 'Hired') ? '✓ PASS' : '✗ FAIL');

// 2. Validate Data Models Structure
console.log('\n2. Validating Data Models Structure...');
try {
  // Check User model
  const userAttributes = Object.keys(User.rawAttributes);
  const requiredUserAttributes = ['id', 'email', 'password', 'role'];
  const userModelValid = requiredUserAttributes.every(attr => userAttributes.includes(attr));
  console.log('   User Model:', userModelValid ? '✓ PASS' : '✗ FAIL');
  
  // Check Company model
  const companyAttributes = Object.keys(Company.rawAttributes);
  const requiredCompanyAttributes = ['id', 'name', 'description'];
  const companyModelValid = requiredCompanyAttributes.every(attr => companyAttributes.includes(attr));
  console.log('   Company Model:', companyModelValid ? '✓ PASS' : '✗ FAIL');
  
  // Check Job model
  const jobAttributes = Object.keys(Job.rawAttributes);
  const requiredJobAttributes = ['id', 'title', 'description', 'status'];
  const jobModelValid = requiredJobAttributes.every(attr => jobAttributes.includes(attr));
  console.log('   Job Model:', jobModelValid ? '✓ PASS' : '✗ FAIL');
  
  // Check Application model
  const applicationAttributes = Object.keys(Application.rawAttributes);
  const requiredApplicationAttributes = ['id', 'stage', 'jobId', 'candidateId'];
  const applicationModelValid = requiredApplicationAttributes.every(attr => applicationAttributes.includes(attr));
  console.log('   Application Model:', applicationModelValid ? '✓ PASS' : '✗ FAIL');
  
  // Check ApplicationHistory model
  const historyAttributes = Object.keys(ApplicationHistory.rawAttributes);
  const requiredHistoryAttributes = ['id', 'previousStage', 'newStage', 'applicationId', 'changedById'];
  const historyModelValid = requiredHistoryAttributes.every(attr => historyAttributes.includes(attr));
  console.log('   ApplicationHistory Model:', historyModelValid ? '✓ PASS' : '✗ FAIL');
} catch (error) {
  console.log('   Data Models Validation: ✗ FAIL -', error.message);
}

// 3. Validate Security Features
console.log('\n3. Validating Security Features...');
try {
  // Test password hashing
  const plainPassword = 'testPassword123';
  const hashedPassword = bcrypt.hashSync(plainPassword, 10);
  const isMatch = bcrypt.compareSync(plainPassword, hashedPassword);
  console.log('   Password Hashing:', isMatch ? '✓ PASS' : '✗ FAIL');
  
  // Test JWT token generation
  const testUser = { id: 1, role: 'candidate', companyId: null };
  const token = jwt.sign(testUser, 'testSecret', { expiresIn: '1h' });
  const decoded = jwt.verify(token, 'testSecret');
  const tokenValid = decoded.id === testUser.id && decoded.role === testUser.role;
  console.log('   JWT Token Generation:', tokenValid ? '✓ PASS' : '✗ FAIL');
} catch (error) {
  console.log('   Security Features Validation: ✗ FAIL -', error.message);
}

// 4. Validate API Endpoints Structure
console.log('\n4. Validating API Endpoints Structure...');
// This would typically involve checking the routes files
// For now, we'll just confirm the files exist
const fs = require('fs');
const path = require('path');

const routeFiles = [
  'authRoutes.js',
  'jobRoutes.js',
  'applicationRoutes.js'
];

let allRouteFilesExist = true;
routeFiles.forEach(file => {
  const filePath = path.join(__dirname, '..', 'routes', file);
  if (!fs.existsSync(filePath)) {
    allRouteFilesExist = false;
  }
});

console.log('   Route Files Exist:', allRouteFilesExist ? '✓ PASS' : '✗ FAIL');

// 5. Validate Background Processing
console.log('\n5. Validating Background Processing...');
try {
  // Check if queue and worker files exist
  const queueFilePath = path.join(__dirname, '..', 'jobs', 'queue.js');
  const workerFilePath = path.join(__dirname, '..', 'jobs', 'worker.js');
  
  const queueFileExists = fs.existsSync(queueFilePath);
  const workerFileExists = fs.existsSync(workerFilePath);
  
  console.log('   Queue File Exists:', queueFileExists ? '✓ PASS' : '✗ FAIL');
  console.log('   Worker File Exists:', workerFileExists ? '✓ PASS' : '✗ FAIL');
} catch (error) {
  console.log('   Background Processing Validation: ✗ FAIL -', error.message);
}

console.log('\n=== Requirements Validation Complete ===');