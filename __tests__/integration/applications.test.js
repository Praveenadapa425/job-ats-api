// File: __tests__/integration/applications.test.js

const request = require('supertest');
const app = require('../../src/app');
const { sequelize, User, Company, Job, Application } = require('../../src/models');
const bcrypt = require('bcryptjs');

// Store tokens and IDs
let recruiterToken, candidateToken, hiringManagerToken, companyId, jobId, applicationId;
let recruiterId, candidateId, hiringManagerId;

beforeAll(async () => {
  // Sync database
  await sequelize.sync({ force: true });
  
  // Create a company
  const company = await Company.create({
    name: 'Test Company',
    description: 'A test company'
  });
  companyId = company.id;
  
  // Create users
  const recruiter = await User.create({
    email: 'recruiter@test.com',
    password: await bcrypt.hash('password123', 10),
    role: 'recruiter',
    companyId: companyId
  });
  recruiterId = recruiter.id;
  
  const candidate = await User.create({
    email: 'candidate@test.com',
    password: await bcrypt.hash('password123', 10),
    role: 'candidate'
  });
  candidateId = candidate.id;
  
  const hiringManager = await User.create({
    email: 'hm@test.com',
    password: await bcrypt.hash('password123', 10),
    role: 'hiring_manager',
    companyId: companyId
  });
  hiringManagerId = hiringManager.id;
  
  // Get tokens
  const recruiterRes = await request(app)
    .post('/api/auth/login')
    .send({ email: 'recruiter@test.com', password: 'password123' });
  recruiterToken = recruiterRes.body.token;
  
  const candidateRes = await request(app)
    .post('/api/auth/login')
    .send({ email: 'candidate@test.com', password: 'password123' });
  candidateToken = candidateRes.body.token;
  
  const hmRes = await request(app)
    .post('/api/auth/login')
    .send({ email: 'hm@test.com', password: 'password123' });
  hiringManagerToken = hmRes.body.token;
  
  // Create a job
  const jobRes = await request(app)
    .post('/api/jobs')
    .set('Authorization', `Bearer ${recruiterToken}`)
    .send({
      title: 'Software Engineer',
      description: 'Develop amazing software products'
    });
  jobId = jobRes.body.id;
});

afterAll(async () => {
  await sequelize.close();
});

describe('Applications API', () => {
  describe('POST /api/applications', () => {
    test('should submit an application successfully as candidate', async () => {
      const res = await request(app)
        .post('/api/applications')
        .set('Authorization', `Bearer ${candidateToken}`)
        .send({
          jobId: jobId
        });
      
      expect(res.status).toBe(201);
      expect(res.body.jobId).toBe(jobId);
      expect(res.body.candidateId).toBe(candidateId);
      expect(res.body.stage).toBe('Applied');
      applicationId = res.body.id;
    });
    
    test('should fail to submit application without jobId', async () => {
      const res = await request(app)
        .post('/api/applications')
        .set('Authorization', `Bearer ${candidateToken}`)
        .send({});
      
      expect(res.status).toBe(400);
    });
    
    test('should fail to submit application as recruiter', async () => {
      const res = await request(app)
        .post('/api/applications')
        .set('Authorization', `Bearer ${recruiterToken}`)
        .send({
          jobId: jobId
        });
      
      expect(res.status).toBe(403);
    });
  });
  
  describe('GET /api/applications/:id', () => {
    test('should get application details as candidate owner', async () => {
      const res = await request(app)
        .get(`/api/applications/${applicationId}`)
        .set('Authorization', `Bearer ${candidateToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.id).toBe(applicationId);
      expect(res.body.stage).toBe('Applied');
    });
    
    test('should get application details as recruiter', async () => {
      const res = await request(app)
        .get(`/api/applications/${applicationId}`)
        .set('Authorization', `Bearer ${recruiterToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.id).toBe(applicationId);
    });
    
    test('should get application details as hiring manager', async () => {
      const res = await request(app)
        .get(`/api/applications/${applicationId}`)
        .set('Authorization', `Bearer ${hiringManagerToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.id).toBe(applicationId);
    });
    
    test('should fail to get application as different candidate', async () => {
      // Create another candidate
      const otherCandidate = await User.create({
        email: 'other@test.com',
        password: await bcrypt.hash('password123', 10),
        role: 'candidate'
      });
      
      const otherCandidateRes = await request(app)
        .post('/api/auth/login')
        .send({ email: 'other@test.com', password: 'password123' });
      const otherCandidateToken = otherCandidateRes.body.token;
      
      const res = await request(app)
        .get(`/api/applications/${applicationId}`)
        .set('Authorization', `Bearer ${otherCandidateToken}`);
      
      expect(res.status).toBe(403);
    });
  });
  
  describe('PUT /api/applications/:id/stage', () => {
    test('should update application stage successfully as recruiter', async () => {
      const res = await request(app)
        .put(`/api/applications/${applicationId}/stage`)
        .set('Authorization', `Bearer ${recruiterToken}`)
        .send({
          newStage: 'Screening'
        });
      
      expect(res.status).toBe(200);
      expect(res.body.application.stage).toBe('Screening');
    });
    
    test('should fail to update application stage as candidate', async () => {
      const res = await request(app)
        .put(`/api/applications/${applicationId}/stage`)
        .set('Authorization', `Bearer ${candidateToken}`)
        .send({
          newStage: 'Interview'
        });
      
      expect(res.status).toBe(403);
    });
    
    test('should fail to update with invalid stage transition', async () => {
      const res = await request(app)
        .put(`/api/applications/${applicationId}/stage`)
        .set('Authorization', `Bearer ${recruiterToken}`)
        .send({
          newStage: 'Hired' // Invalid transition from Screening
        });
      
      expect(res.status).toBe(400);
    });
  });
  
  describe('GET /api/applications', () => {
    test('should get applications list as candidate', async () => {
      const res = await request(app)
        .get('/api/applications')
        .set('Authorization', `Bearer ${candidateToken}`);
      
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      // Should only see own applications
      expect(res.body.every(app => app.candidateId === candidateId)).toBe(true);
    });
    
    test('should get applications list as recruiter', async () => {
      const res = await request(app)
        .get('/api/applications')
        .set('Authorization', `Bearer ${recruiterToken}`);
      
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      // Should only see applications for own company
      expect(res.body.every(app => app.Job.companyId === companyId)).toBe(true);
    });
    
    test('should get applications list as hiring manager', async () => {
      const res = await request(app)
        .get('/api/applications')
        .set('Authorization', `Bearer ${hiringManagerToken}`);
      
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      // Should only see applications for own company
      expect(res.body.every(app => app.Job.companyId === companyId)).toBe(true);
    });
  });
});