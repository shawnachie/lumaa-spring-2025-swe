# Task Management Application

A TypeScript-based task management application with user authentication and CRUD operations for tasks. Built with React, Node.js, and PostgreSQL.

## Features

- User authentication (register/login) with JWT
- Task management:
  - Create new tasks
  - View list of tasks
  - Update existing tasks
  - Mark tasks as complete
  - Delete tasks
- Secure API endpoints
- PostgreSQL database for data persistence

## Prerequisites

- Node.js (v20 or later)
- PostgreSQL database

## Environment Variables

The following environment variables are required:

```env
DATABASE_URL=postgresql://username:password@host:port/database
JWT_SECRET=your-jwt-secret
```

## Database Setup

1. The application uses Drizzle ORM for database management. The schema is defined in `shared/schema.ts`.

2. To set up the database tables, run:
```bash
npm run db:push
```

This command will create/update the following tables:
- `users` - Stores user information
- `tasks` - Stores task information
- `session` - Manages user sessions

## Running the Application

The application uses a single command to run both frontend and backend:

```bash
npm run dev
```

This will start:
- Backend server on port 5000
- Frontend development server with hot reloading
- Database connection

## API Endpoints

### Authentication

- `POST /auth/register` - Register a new user
  - Body: `{ username: string, password: string }`
  - Returns: `{ user: User, token: string }`

- `POST /auth/login` - Login user
  - Body: `{ username: string, password: string }`
  - Returns: `{ user: User, token: string }`

- `GET /auth/user` - Get current user info
  - Requires: Authorization header with JWT token
  - Returns: `User` object

### Tasks

All task endpoints require authentication via JWT token in the Authorization header.

- `GET /tasks` - Get all tasks for current user
- `POST /tasks` - Create a new task
  - Body: `{ title: string, description?: string }`
- `PUT /tasks/:id` - Update a task
  - Body: `{ title?: string, description?: string, isComplete?: boolean }`
- `DELETE /tasks/:id` - Delete a task

## Architecture

- Frontend: React + TypeScript with shadcn/ui components
- Backend: Express.js + TypeScript
- Database: PostgreSQL with Drizzle ORM
- Authentication: JWT tokens
- State Management: TanStack Query (React Query)

## Development Notes

- The frontend code is in the `client/src` directory
- Backend code is in the `server` directory
- Shared types and schemas are in the `shared` directory
- API requests are automatically authenticated if a valid JWT token exists in localStorage
- Tasks are automatically filtered by the current user on the backend

## Testing

For testing the API endpoints:
1. Register a new user through the `/auth/register` endpoint
2. Use the returned JWT token in the Authorization header for subsequent requests
3. Test CRUD operations on tasks using the tasks endpoints

The frontend includes built-in error handling and loading states for a better user experience.
