// File: src/demo/workflowDemo.js

const { isValidTransition, getValidNextStages } = require('../services/applicationService');

console.log('=== Job Application Tracking System Workflow Demo ===\n');

// Demonstrate valid transitions
console.log('Valid Transitions:');
console.log('Applied -> Screening:', isValidTransition('Applied', 'Screening'));
console.log('Screening -> Interview:', isValidTransition('Screening', 'Interview'));
console.log('Interview -> Offer:', isValidTransition('Interview', 'Offer'));
console.log('Offer -> Hired:', isValidTransition('Offer', 'Hired'));

console.log('\nReject from any stage:');
console.log('Applied -> Rejected:', isValidTransition('Applied', 'Rejected'));
console.log('Screening -> Rejected:', isValidTransition('Screening', 'Rejected'));
console.log('Interview -> Rejected:', isValidTransition('Interview', 'Rejected'));
console.log('Offer -> Rejected:', isValidTransition('Offer', 'Rejected'));
console.log('Hired -> Rejected:', isValidTransition('Hired', 'Rejected'));

console.log('\nInvalid Transitions:');
console.log('Applied -> Interview:', isValidTransition('Applied', 'Interview'));
console.log('Screening -> Hired:', isValidTransition('Screening', 'Hired'));

console.log('\nValid Next Stages:');
console.log('From Applied:', getValidNextStages('Applied'));
console.log('From Screening:', getValidNextStages('Screening'));
console.log('From Interview:', getValidNextStages('Interview'));
console.log('From Offer:', getValidNextStages('Offer'));
console.log('From Hired:', getValidNextStages('Hired'));
console.log('From Rejected:', getValidNextStages('Rejected'));