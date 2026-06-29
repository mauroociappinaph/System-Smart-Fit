# Exploration: Docker Compose for Local Development

## Current State Analysis

### Backend Configuration
- Runs on port: `process.env.PORT ?? 3000` (default 3000)
- Environment file: `backend/.env`
- Currently configured for remote Supabase database
- Uses NestJS framework
- Entry point: `backend/src/main.ts`

### Frontend Configuration  
- Runs on default Next.js dev port: 3000
- Environment file: `frontend/.env.local`
- Configured to proxy API calls to: `NEXT_PUBLIC_API_URL=http://localhost:3001/api`
- This means backend should run on port 3001 for development
- Uses Next.js 15 with React 19

### Required Changes for Local Development
1. Backend needs to run on port 3001 (to match frontend expectation)
2. Need local PostgreSQL service for development
3. Need to override DATABASE_URL to point to local PostgreSQL
4. Services should be able to communicate via Docker network

### Dependencies Identified
- PostgreSQL database (for development)
- Backend NestJS application
- Frontend Next.js application

### Networking Plan
- Backend will be accessible on host port 3001
- Frontend will be accessible on host port 3000  
- Internal Docker network will allow service-to-service communication
- Frontend will call backend via localhost:3000, which proxies to backend at backend-service:3001 internally
- Or alternatively, we could keep frontend calling localhost:3001 and have both exposed

### Simpler Approach
Since frontend is configured to call `http://localhost:3001/api`, we have two options:
1. Keep this configuration and expose backend on port 3001
2. Change frontend to call a different host/port and adjust accordingly

Option 1 is simpler since it requires no frontend changes.

## Proposed Solution
Create docker-compose.yml with three services:
1. postgres: PostgreSQL database on default port 5432 (internal only)
2. backend: NestJS app on port 3001 
3. frontend: Next.js app on port 3000

Environment overrides:
- Backend: PORT=3001, DATABASE_URL="postgresql://postgres:password@postgres:5432/devdb?schema=public"
- Frontend: NO CHANGE NEEDED (already points to localhost:3001)