// File: __tests__/integration/jobs.test.js

const request = require('supertest');
const app = require('../../src/app');
const { sequelize, User, Company, Job } = require('../../src/models');
const bcrypt = require('bcryptjs');

// Store tokens and IDs
let recruiterToken, candidateToken, companyId, jobId;
let recruiterId, candidateId;

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
  
  // Get tokens
  const recruiterRes = await request(app)
    .post('/api/auth/login')
    .send({ email: 'recruiter@test.com', password: 'password123' });
  recruiterToken = recruiterRes.body.token;
  
  const candidateRes = await request(app)
    .post('/api/auth/login')
    .send({ email: 'candidate@test.com', password: 'password123' });
  candidateToken = candidateRes.body.token;
  
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

describe('Jobs API', () => {
  describe('POST /api/jobs', () => {
    test('should create a job successfully as recruiter', async () => {
      const res = await request(app)
        .post('/api/jobs')
        .set('Authorization', `Bearer ${recruiterToken}`)
        .send({
          title: 'Frontend Developer',
          description: 'Build user interfaces'
        });
      
      expect(res.status).toBe(201);
      expect(res.body.title).toBe('Frontend Developer');
      expect(res.body.companyId).toBe(companyId);
    });
    
    test('should fail to create a job as candidate', async () => {
      const res = await request(app)
        .post('/api/jobs')
        .set('Authorization', `Bearer ${candidateToken}`)
        .send({
          title: 'Backend Developer',
          description: 'Build server-side applications'
        });
      
      expect(res.status).toBe(403);
    });
  });
  
  describe('GET /api/jobs', () => {
    test('should get all jobs as authenticated user', async () => {
      const res = await request(app)
        .get('/api/jobs')
        .set('Authorization', `Bearer ${candidateToken}`);
      
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });
    
    test('should get a specific job by ID', async () => {
      const res = await request(app)
        .get(`/api/jobs/${jobId}`)
        .set('Authorization', `Bearer ${candidateToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.id).toBe(jobId);
      expect(res.body.title).toBe('Software Engineer');
    });
  });
  
  describe('PUT /api/jobs/:id', () => {
    test('should update a job successfully as recruiter', async () => {
      const res = await request(app)
        .put(`/api/jobs/${jobId}`)
        .set('Authorization', `Bearer ${recruiterToken}`)
        .send({
          title: 'Senior Software Engineer',
          description: 'Lead development team'
        });
      
      expect(res.status).toBe(200);
      expect(res.body.title).toBe('Senior Software Engineer');
    });
    
    test('should fail to update a job as candidate', async () => {
      const res = await request(app)
        .put(`/api/jobs/${jobId}`)
        .set('Authorization', `Bearer ${candidateToken}`)
        .send({
          title: 'Updated Title',
          description: 'Updated Description'
        });
      
      expect(res.status).toBe(403);
    });
  });
  
  describe('DELETE /api/jobs/:id', () => {
    test('should delete a job successfully as recruiter', async () => {
      // First create a job to delete
      const jobRes = await request(app)
        .post('/api/jobs')
        .set('Authorization', `Bearer ${recruiterToken}`)
        .send({
          title: 'Temporary Job',
          description: 'This job will be deleted'
        });
      const tempJobId = jobRes.body.id;
      
      const res = await request(app)
        .delete(`/api/jobs/${tempJobId}`)
        .set('Authorization', `Bearer ${recruiterToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Job deleted successfully');
    });
    
    test('should fail to delete a job as candidate', async () => {
      const res = await request(app)
        .delete(`/api/jobs/${jobId}`)
        .set('Authorization', `Bearer ${candidateToken}`);
      
      expect(res.status).toBe(403);
    });
  });
});