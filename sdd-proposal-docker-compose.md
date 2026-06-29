# Proposal: Docker Compose for Local Development

## Problem Statement
Developers need to manually set up and configure multiple services (PostgreSQL, backend, frontend) to run the application locally. This creates friction in onboarding and inconsistent development environments.

## Proposed Solution
Create a docker-compose.yml file that orchestrates all required services for local development with proper networking, volume mounts for code changes, and environment variable overrides.

## Solution Details

### Services
1. **postgres**: Official PostgreSQL 15 image
   - Ports: 5432:5432 (exposed for debugging, but primarily internal)
   - Environment: POSTGRES_USER=postgres, POSTGRES_PASSWORD=postgres, POSTGRES_DB=devdb
   - Volumes: postgres_data:/var/lib/postgresql/data (persistent data)

2. **backend**: NestJS application
   - Build context: ./backend
   - Ports: 3001:3001 
   - Environment: 
     - PORT=3001
     - DATABASE_URL="postgresql://postgres:postgres@postgres:5432/devdb?schema=public"
   - Volumes: 
     - ./backend:/app (for live code editing)
     - /app/node_modules (to avoid overwriting container deps)
   - Depends_on: postgres
   - Command: npm run start:dev (or equivalent for hot reload)

3. **frontend**: Next.js application
   - Build context: ./frontend  
   - Ports: 3000:3000
   - Environment:
     - NEXT_PUBLIC_API_URL=http://localhost:3001/api (already matches)
   - Volumes:
     - ./frontend:/app
     - /app/node_modules
   - Depends_on: backend (to ensure backend is ready)
   - Command: npm run dev

### Benefits
- One-command startup: `docker compose up`
- Consistent environments across developers
- Hot reloading preserved through volume mounts
- Easy to reset database with volume management
- Matches production-like networking patterns

### Alternatives Considered
1. **Separate docker-compose files per service** - Rejected because it defeats the purpose of orchestration
2. **Using docker-compose.override.yml** - Considered but single file is simpler for this use case
3. **Not exposing postgres port** - Considered but keeping it exposed aids in debugging with GUI tools

### Success Criteria
- `docker compose up --build` starts all services successfully
- Frontend accessible at http://localhost:3000
- Backend API accessible at http://localhost:3001/api  
- Database accessible at localhost:5432 for debugging
- Code changes in host trigger container rebuilds/restarts for hot reloading
- Services can communicate via docker network (backend → postgres)

## Implementation Plan
1. Create docker-compose.yml in project root
2. Test basic startup and connectivity
3. Verify hot reloading works
4. Document usage in README