# Job Application Tracking System (ATS) API

A robust backend system for managing job applications with complex workflows, role-based access control, and asynchronous email notifications.

## Features

- **State Machine Workflow**: Enforces valid application stage transitions (Applied → Screening → Interview → Offer → Hired)
- **Role-Based Access Control**: Candidates, Recruiters, and Hiring Managers with appropriate permissions
- **Asynchronous Email Notifications**: Non-blocking email system using BullMQ and SendGrid
- **Audit Trail**: Complete history of application stage changes
- **RESTful API**: Well-structured endpoints for all system operations

## Technology Stack

- **Backend**: Node.js with Express.js
- **Database**: PostgreSQL with Sequelize ORM
- **Authentication**: JWT (JSON Web Tokens)
- **Background Jobs**: BullMQ with Redis
- **Email Service**: SendGrid
- **Testing**: Jest

## Project Structure

```
src/
├── config/          # Database configuration
├── controllers/     # Request handlers
├── jobs/            # Background job processing
├── middleware/      # Authentication and authorization
├── models/          # Database models
├── routes/          # API route definitions
├── services/        # Business logic
└── demo/            # Demonstration scripts
```

## Core Models

1. **User**: Candidates, Recruiters, and Hiring Managers
2. **Company**: Organizations that post jobs
3. **Job**: Job postings with status (open/closed)
4. **Application**: Candidate applications with state machine
5. **ApplicationHistory**: Audit trail of stage changes

## Database Schema (ERD)

```
User (id, email, password, role, companyId)
     1 │                     │
       │                     │
     ╭─┴─────────────────────╯
     ↓
Company (id, name, description)
     1 │
       │
     ╭─╯
     ↓
  Job (id, title, description, status, companyId)
     1 │
       │
     ╭─╯
     ↓
Application (id, stage, jobId, candidateId)
     1 │
       │
     ╭─╯
     ↓
ApplicationHistory (id, previousStage, newStage, applicationId, changedById, createdAt)
```

## Workflow States

The application follows a predefined workflow with the following valid transitions:

```
Applied → Screening → Interview → Offer → Hired
   │         │          │         │        │
   └─────────┴──────────┴─────────┴────────┘→ Rejected (from any stage)
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Jobs
- `GET /api/jobs` - Get all jobs
- `GET /api/jobs/:id` - Get a specific job
- `POST /api/jobs` - Create a new job (Recruiters only)
- `PUT /api/jobs/:id` - Update a job (Recruiters only)
- `DELETE /api/jobs/:id` - Delete a job (Recruiters only)

### Applications
- `POST /api/applications` - Submit a new application (Candidates only)
- `GET /api/applications/:id` - Get application details
- `PUT /api/applications/:id/stage` - Update application stage (Recruiters only)
- `GET /api/applications` - Get applications with filtering

## Role-Based Access Control

| Role           | Permissions |
|----------------|-------------|
| **Candidate**  | Apply for jobs, view own applications |
| **Recruiter**  | Manage jobs for their company, view/manage all applications |
| **Hiring Manager** | View applications for assigned jobs |

## Setup Instructions

1. Clone the repository
2. Install dependencies: `npm install`
3. Create a `.env` file based on `.env.example`
4. Set up PostgreSQL database
5. Set up Redis server
6. Configure SendGrid API key
7. Run database migrations: `npm run dev`
8. Start the worker: `npm run worker`

## Environment Variables

Create a `.env` file with the following variables:

```
DB_NAME=your_database_name
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_HOST=localhost
JWT_SECRET=your_jwt_secret
REDIS_URL=redis://localhost:6379
SENDGRID_API_KEY=your_sendgrid_api_key
PORT=3000
```

## Running the Application

- Start the server: `npm start` or `npm run dev`
- Start the worker: `npm run worker`
- Run tests: `npm test`

## Testing

Run the state machine demo:
```bash
node src/demo/workflowDemo.js
```

## License

This project is licensed under the MIT License.