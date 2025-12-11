// File: __tests__/integration/auth.test.js

const request = require('supertest');
const app = require('../../src/app');
const { sequelize, User, Company } = require('../../src/models');
const bcrypt = require('bcryptjs');

// Store tokens for different user roles
let candidateToken, recruiterToken, hiringManagerToken;
let candidateId, recruiterId, hiringManagerId, companyId;

beforeAll(async () => {
  // Sync database
  await sequelize.sync({ force: true });
  
  // Create a company
  const company = await Company.create({
    name: 'Test Company',
    description: 'A test company'
  });
  companyId = company.id;
  
  // Create users for each role
  const candidate = await User.create({
    email: 'candidate@test.com',
    password: await bcrypt.hash('password123', 10),
    role: 'candidate'
  });
  candidateId = candidate.id;
  
  const recruiter = await User.create({
    email: 'recruiter@test.com',
    password: await bcrypt.hash('password123', 10),
    role: 'recruiter',
    companyId: companyId
  });
  recruiterId = recruiter.id;
  
  const hiringManager = await User.create({
    email: 'hm@test.com',
    password: await bcrypt.hash('password123', 10),
    role: 'hiring_manager',
    companyId: companyId
  });
  hiringManagerId = hiringManager.id;
  
  // Get tokens for each user
  const candidateRes = await request(app)
    .post('/api/auth/login')
    .send({ email: 'candidate@test.com', password: 'password123' });
  candidateToken = candidateRes.body.token;
  
  const recruiterRes = await request(app)
    .post('/api/auth/login')
    .send({ email: 'recruiter@test.com', password: 'password123' });
  recruiterToken = recruiterRes.body.token;
  
  const hmRes = await request(app)
    .post('/api/auth/login')
    .send({ email: 'hm@test.com', password: 'password123' });
  hiringManagerToken = hmRes.body.token;
});

afterAll(async () => {
  await sequelize.close();
});

describe('Authentication API', () => {
  describe('POST /api/auth/register', () => {
    test('should register a candidate successfully', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'newcandidate@test.com',
          password: 'password123',
          role: 'candidate'
        });
      
      expect(res.status).toBe(201);
      expect(res.body.message).toBe('User registered successfully!');
    });
    
    test('should register a recruiter with company', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'newrecruiter@test.com',
          password: 'password123',
          role: 'recruiter',
          companyName: 'New Test Company'
        });
      
      expect(res.status).toBe(201);
      expect(res.body.message).toBe('User registered successfully!');
    });
    
    test('should fail to register without required fields', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'incomplete@test.com'
          // Missing password and role
        });
      
      expect(res.status).toBe(400);
    });
  });
  
  describe('POST /api/auth/login', () => {
    test('should login successfully with valid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'candidate@test.com',
          password: 'password123'
        });
      
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
    });
    
    test('should fail to login with invalid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'candidate@test.com',
          password: 'wrongpassword'
        });
      
      expect(res.status).toBe(401);
    });
  });
});