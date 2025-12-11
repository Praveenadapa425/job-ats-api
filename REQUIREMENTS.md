# Job Application Tracking System (ATS) API - Requirements Documentation

## 1. Core Requirements

### 1.1 Data Models

#### User Model
- **Roles**: candidate, recruiter, hiring_manager
- **Fields**: id, email, password, role, companyId (nullable)
- **Security**: Passwords hashed using bcryptjs before storage
- **Validation**: Email format validation, unique email constraint

#### Company Model
- **Fields**: id, name, description
- **Constraints**: Unique company names
- **Relationships**: One-to-many with Users and Jobs

#### Job Model
- **Fields**: id, title, description, status (open/closed)
- **Status**: Defaults to 'open'
- **Relationships**: Belongs to Company, has many Applications

#### Application Model
- **Fields**: id, stage (Applied, Screening, Interview, Offer, Hired, Rejected)
- **Default Stage**: 'Applied'
- **Relationships**: Belongs to Job and Candidate (User), has many ApplicationHistory records

#### ApplicationHistory Model
- **Fields**: id, previousStage, newStage, applicationId, changedById, createdAt
- **Purpose**: Audit trail for all application stage changes
- **Relationships**: Belongs to Application and User (who made the change)

### 1.2 Workflow and State Management

#### Valid State Transitions
```
Applied → Screening → Interview → Offer → Hired
   │         │          │         │        │
   └─────────┴──────────┴─────────┴────────┘→ Rejected (from any stage)
```

#### Transition Rules
- Applications follow a linear progression through the hiring pipeline
- Rejected status can be reached from any stage
- Invalid transitions (e.g., Applied → Interview) are prevented
- All transitions are logged in ApplicationHistory

### 1.3 API Endpoints

#### Authentication
- `POST /api/auth/register` - Public endpoint for user registration
- `POST /api/auth/login` - Public endpoint for user authentication

#### Jobs
- `GET /api/jobs` - Retrieve all jobs (authenticated users)
- `GET /api/jobs/:id` - Retrieve specific job (authenticated users)
- `POST /api/jobs` - Create new job (recruiters only)
- `PUT /api/jobs/:id` - Update job (recruiters only, company-restricted)
- `DELETE /api/jobs/:id` - Delete job (recruiters only, company-restricted)

#### Applications
- `POST /api/applications` - Submit application (candidates only)
- `GET /api/applications/:id` - View application details (candidate, recruiter, hiring_manager)
- `PUT /api/applications/:id/stage` - Update application stage (recruiters only)
- `GET /api/applications` - List applications with filtering (candidate, recruiter, hiring_manager)

### 1.4 Asynchronous Email Notifications

#### Trigger Events
- Candidate submits application → Confirmation to candidate
- Application stage changes → Notification to candidate
- New application submitted → Notification to recruiter

#### Implementation
- Email tasks queued using BullMQ with Redis
- Background worker processes email jobs independently
- SendGrid handles actual email delivery
- Non-blocking operations ensure API responsiveness

### 1.5 Authorization (RBAC)

#### Role Permissions
| Role | Permissions |
|------|-------------|
| **Candidate** | Apply for jobs, view own applications |
| **Recruiter** | Manage jobs for their company, view/manage all applications |
| **Hiring Manager** | View applications for assigned jobs (fallback: view all company jobs) |

#### Access Controls
- All endpoints require authentication
- Role-based restrictions enforced at route and controller levels
- Data-level filtering ensures users only access relevant records

## 2. Implementation Guidelines

### 2.1 Architecture

#### Layered Design
- **Models**: Data access layer with Sequelize ORM
- **Controllers**: Request handling and response formatting
- **Services**: Business logic (state transitions, email notifications)
- **Routes**: API endpoint definitions with middleware
- **Middleware**: Authentication, authorization, validation

#### Separation of Concerns
- Controllers handle HTTP concerns only
- Services contain business logic
- Models manage data persistence
- Routes define API contracts

### 2.2 Decoupled Notification Logic

#### Message Queue Implementation
- BullMQ with Redis for job queuing
- Background worker processes jobs asynchronously
- Retry mechanisms for failed deliveries
- Independent scaling of worker processes

### 2.3 State Management

#### Centralized Transition Logic
- Dedicated service for state validation and transitions
- Single source of truth for valid transitions
- Automatic audit trail creation
- Email notifications triggered on state changes

### 2.4 Database Design

#### Relational Integrity
- Foreign key constraints between all related entities
- Cascade operations where appropriate
- Indexes on frequently queried fields
- Transactional consistency for multi-table operations

#### Audit Trail
- ApplicationHistory records all stage changes
- Timestamps for all changes
- User identification for accountability

### 2.5 Best Practices

#### Security
- Environment variables for all secrets
- JWT for stateless authentication
- bcryptjs for password hashing
- Role-based access controls

#### Error Handling
- Comprehensive validation at entry points
- Consistent error response formats
- Appropriate HTTP status codes
- Graceful degradation for non-critical failures

#### Testing
- Unit tests for business logic
- Integration tests for API endpoints
- State transition validation
- RBAC rule verification

## 3. Expected Outcomes

### 3.1 Functional Requirements

#### REST API Completeness
- All specified endpoints implemented and functional
- Role-based access restrictions properly enforced
- Data validation and error handling in place
- Comprehensive request/response documentation

#### Workflow Implementation
- State machine correctly prevents invalid transitions
- All valid transitions permitted as specified
- Rejected status accessible from any stage
- Audit trail captures all stage changes

#### Notification System
- Email notifications triggered on specified events
- Asynchronous processing ensures API responsiveness
- Reliable delivery with error handling
- Background worker operates independently

#### Access Control
- RBAC correctly implemented for all roles
- Data filtering ensures appropriate visibility
- Unauthorized access attempts properly rejected
- Company-level restrictions enforced

### 3.2 Non-Functional Requirements

#### Performance
- API responses within acceptable time limits
- Background processing doesn't block main thread
- Database queries optimized with indexes
- Connection pooling for database and Redis

#### Reliability
- Error handling for database connectivity issues
- Retry mechanisms for external service failures
- Data consistency maintained during operations
- Audit trail completeness guaranteed

#### Maintainability
- Clear code organization following established patterns
- Comprehensive documentation of API and architecture
- Modular design allows for future enhancements
- Consistent coding standards throughout

#### Security
- Protection against common web vulnerabilities
- Secure storage of sensitive information
- Proper authentication and authorization
- Input validation to prevent injection attacks

## 4. Technology Stack Alignment

### 4.1 Backend Framework
- **Node.js with Express.js**: Provides lightweight, flexible foundation for REST API

### 4.2 Database
- **PostgreSQL with Sequelize ORM**: Robust relational database with mature ORM support

### 4.3 Authentication
- **JWT**: Stateless authentication mechanism suitable for distributed systems

### 4.4 Background Processing
- **BullMQ with Redis**: Reliable message queue implementation with good Node.js support

### 4.5 Email Service
- **SendGrid**: Scalable email delivery platform with good reliability

### 4.6 Testing
- **Jest**: Comprehensive testing framework for JavaScript applications

## 5. Environment and Deployment

### 5.1 Required Services
- PostgreSQL database server
- Redis server for message queue
- SendGrid account for email delivery
- Node.js runtime environment (v12+)

### 5.2 Configuration
- All configuration via environment variables
- .env.example file for developer onboarding
- Clear documentation of all required variables
- Default values where appropriate for development

### 5.3 Startup Procedures
- Database schema synchronization via Sequelize
- Main API server startup
- Background worker initialization
- Health checks for all dependent services