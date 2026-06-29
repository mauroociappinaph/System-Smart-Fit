# Specification: Docker Compose Development Environment

## Functional Requirements

### FR1: Service Orchestration
The system shall provide a single command to start all required services for local development.

### FR2: Port Mapping
The system shall expose services on the following host ports:
- FR2.1: Frontend on port 3000
- FR2.2: Backend API on port 3001  
- FR2.3: PostgreSQL database on port 5432 (optional, for debugging)

### FR3: Volume Mounting for Development
The system shall mount source code into containers to enable hot reloading:
- FR3.1: Backend code changes trigger automatic rebuild/restart
- FR3.2: Frontend code changes trigger automatic recompilation
- FR3.3: Node modules remain isolated in containers to prevent host/container conflicts

### FR4: Environment Configuration
The system shall provide appropriate environment variables:
- FR4.1: Backend PORT=3001
- FR4.2: Backend DATABASE_URL pointing to PostgreSQL service
- FR4.3: Preserve existing frontend NEXT_PUBLIC_API_URL configuration

### FR5: Service Dependencies
The system shall ensure proper startup ordering:
- FR5.1: Backend shall wait for PostgreSQL to be ready
- FR5.2: Frontend shall start after backend is available (optional enhancement)

### FR6: Data Persistence
The system shall preserve database state between sessions:
- FR6.1: Named volume for PostgreSQL data storage
- FR6.2: Option to easily reset database state

## Non-Functional Requirements

### NFR1: Performance
- NFR1.1: Container startup time < 30 seconds after initial build
- NFR1.2: File change detection latency < 2 seconds for hot reloading

### NFR2: Reliability  
- NFR2.1: Services shall restart automatically on failure (unless stopped manually)
- NFR2.2: Clear error messages when services fail to start

### NFR3: Usability
- NFR3.1: Single command to start all services
- NFR3.2: Clear logging output from all services
- NFR3.3: Simple command to stop and clean up resources

### NFR4: Maintainability
- NFR4.1: Use official Docker images where possible
- NFR4.2: Minimal custom configuration
- NFR4.3: Clear separation of concerns in docker-compose.yml

## Interface Requirements

### IR1: Network Communication
- IR1.1: Backend shall connect to PostgreSQL using hostname 'postgres'
- IR1.2: Frontend shall access backend via localhost:3000 (host) which maps to container port 3001
- IR1.3: All services shall share a default Docker network

### IR2: Volume Mounts
- IR2.1: Backend source: ./backend → /app (with /app/node_modules excluded)
- IR2.2: Frontend source: ./frontend → /app (with /app/node_modules excluded)  
- IR2.3: PostgreSQL data: pgdata volume → /var/lib/postgresql/data

## Acceptance Criteria

### AC1: Basic Functionality
[ ] `docker compose up --build` starts all three services without errors
[ ] Frontend loads in browser at http://localhost:3000
[ ] Backend API responds at http://localhost:3001/health (or equivalent endpoint)
[ ] PostgreSQL accepts connections on localhost:5432

### AC2: Hot Reloading
[ ] Backend TypeScript changes trigger rebuild and restart
[ ] Frontend React/TypeScript changes trigger recompilation and browser refresh
[ ] Node modules in containers remain consistent with package.json

### AC3: Data Persistence
[ ] Database changes persist between container restarts
[ ] `docker compose down -v` removes all data
[ ] `docker compose down` preserves data

### AC4: Logging
[ ] All service logs visible in docker compose output
[ ] Log timestamps included for debugging

## Assumptions and Dependencies

### Assumptions
- Docker Engine v20.10+ and Docker Compose v2+ available
- Node.js 18+ and npm 9+ available in containers (via base images)
- Developers have basic Docker familiarity

### Dependencies
- None beyond standard Docker infrastructure
- Uses existing application code unchanged (except environment overrides)