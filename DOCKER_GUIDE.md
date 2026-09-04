# Docker Setup Guide for HR Management System

## Quick Start

### Prerequisites
- Docker Desktop installed and running
- Docker Compose installed (comes with Docker Desktop)

### Running the Project

1. **Start all services**:
   ```bash
   docker-compose up --build
   ```
   - `--build` rebuilds images from source code
   - Omit `--build` on subsequent runs if code didn't change

2. **Stop services**:
   ```bash
   docker-compose down
   ```

3. **View logs**:
   ```bash
   docker-compose logs -f backend    # Backend logs
   docker-compose logs -f frontend   # Frontend logs
   docker-compose logs -f postgres   # Database logs
   ```

4. **Access the application**:
   - Frontend: http://192.168.122.133:3000
   - Backend API: http://192.168.122.133:8081/api
   - Database: 192.168.122.133:5433 (PostgreSQL)

---

## What Docker Does

Docker packages your application and its dependencies into containers—isolated environments that work the same everywhere.

### Your Architecture

```
Docker Compose (Orchestrator)
├── PostgreSQL Database (postgres:15-alpine)
│   └── Port: 5433 → 5432 (internal)
│   └── Volume: postgres_data (persistent storage)
│
├── Java Backend (Spring Boot)
│   ├── Dockerfile: Builds from Java 17 Alpine
│   └── Port: 8081:8081
│   └── Depends on: postgres (waits for health check)
│
└── React Frontend
    ├── Dockerfile: Multi-stage build (Node 20 Alpine)
    ├── Build stage: npm install + npm run build
    ├── Production: Serves with 'serve' package
    └── Port: 3000:3000
```

---

## Understanding Each Service

### 1. PostgreSQL Database
```yaml
postgres:
  image: postgres:15-alpine
  environment:
    POSTGRES_DB: HRS
    POSTGRES_USER: postgres
    POSTGRES_PASSWORD: 1234
  ports:
    - "5433:5432"  # Host:Container
```
- Uses official PostgreSQL image (lightweight Alpine version)
- Creates database `HRS` on startup
- Data persists in `postgres_data` volume even if container stops
- Health check ensures it's ready before backend starts

### 2. Java Backend
```
FROM eclipse-temurin:17-jdk-alpine
│
├── Dependencies cached (mvnw dependency:go-offline)
├── Source code copied
├── Build & package (mvnw package)
└── Run JAR file on startup
```
- **Multi-stage benefits**: Only final image is used (smaller)
- **Alpine**: Tiny Linux base (~150MB vs 500MB+ standard)
- **Why cache dependencies?**: If code changes but dependencies don't, Docker reuses cached layer (faster builds)

### 3. React Frontend
```
Stage 1: Builder
├── Node 20 installed
├── npm dependencies installed
├── npm run build (creates 'build' folder)
└── Delete node_modules (not needed in production)

Stage 2: Production
├── Lightweight Node base
├── Copy only 'build' folder from stage 1
├── Serve with 'serve' package
└── Much smaller final image
```
- **Why two stages?**: Separates build tools from production (smaller final image)
- **Serve package**: Production-ready Node server for React apps

---

## Key Concepts Explained

### Ports (8081:8081)
```
Host Port : Container Port
  ↓            ↓
Your laptop  Inside container
```
- Access backend at `192.168.122.133:8081`
- Internally, containers reach each other by service name: `postgres`, `backend`, `frontend`

### Environment Variables
Used to configure apps without changing code:
```yaml
SPRING_DATASOURCE_URL: jdbc:postgresql://postgres:5432/HRS
                                        └─── Service name (Docker DNS)
```

### Volumes
Persist data when containers stop:
```yaml
postgres_data:/var/lib/postgresql/data
└─ Named volume (stored by Docker)
```

### Health Checks
```yaml
healthcheck:
  test: ["CMD-SHELL", "pg_isready -U postgres"]
  interval: 10s
```
- Backend waits for this before starting (prevents connection errors)

### depends_on
```yaml
backend:
  depends_on:
    postgres:
      condition: service_healthy
```
- Backend doesn't start until postgres is ready
- Without this, backend fails trying to connect to postgres

---

## Common Docker Commands

```bash
# View all running containers
docker ps

# View all images
docker images

# Remove unused images/volumes
docker system prune

# Stop specific service
docker-compose stop backend

# Restart service
docker-compose restart backend

# Access backend logs (last 50 lines)
docker-compose logs --tail=50 backend

# Execute command in running container
docker-compose exec backend sh    # Access container shell
docker-compose exec postgres psql -U postgres -d HRS

# Rebuild specific service
docker-compose build --no-cache backend
```

---

## Troubleshooting

### Backend can't connect to database
- Ensure `postgres` service is healthy: `docker-compose logs postgres`
- Check backend uses `postgres:5432` not `192.168.122.133:5433`
- Wait 10-15 seconds for postgres health check

### Frontend shows blank page
- Check logs: `docker-compose logs frontend`
- Ensure `REACT_APP_API_URL=http://192.168.122.133:8081/api`
- Clear browser cache (Ctrl+Shift+Delete)

### Port already in use
```bash
# Find what's using port
netstat -ano | findstr :8081  # Windows
lsof -i :8081                 # Mac/Linux

# Change ports in docker-compose.yml
"8082:8081"  # Use 8082 instead
```

### Rebuild everything
```bash
docker-compose down --volumes
docker-compose up --build
```

---

## What Changed
1. ✅ Created `frontend/Dockerfile` (multi-stage React build)
2. ✅ Fixed `application.properties` to use `postgres:5432` (Docker service name)
3. ✅ Updated `docker-compose.yml` to reference correct Dockerfile paths

---

## Next Steps

1. **Run locally first**:
   ```bash
   # Terminal 1: Backend
   mvn spring-boot:run
   
   # Terminal 2: Frontend
   cd frontend && npm start
   ```

2. **Then try Docker**:
   ```bash
   docker-compose up --build
   ```

3. **Test the flow**:
   - Login at http://192.168.122.133:3000
   - Check backend at http://192.168.122.133:8081/api/employees
   - Monitor logs in real-time

---

## Security Notes (For Production)
⚠️ Your current setup is for **development only**. Before production:

1. **Change hardcoded passwords**:
   - Use `.env` file: `docker-compose.env`
   - Reference in docker-compose.yml: `env_file: docker-compose.env`

2. **Example `.env` file**:
   ```
   POSTGRES_PASSWORD=your-secure-password-here
   DB_USER=postgres
   DB_PASSWORD=your-secure-password-here
   ```

3. **Update docker-compose.yml**:
   ```yaml
   postgres:
     environment:
       POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
   ```

4. **Add `.env` to `.gitignore`** (never commit secrets!)

### Automatic CI/CD Deployment

Pushes to `main` or `master` run the tests, publish both Docker images, and deploy them over SSH. Configure these GitHub repository secrets before using the deployment job:

- `DOCKERHUB_USERNAME`
- `DOCKERHUB_TOKEN`
- `SERVER_HOST`
- `SERVER_USER`
- `SERVER_SSH_KEY`
- `SERVER_APP_PATH` (the existing application directory on the server)
- `POSTGRES_PASSWORD`

The SSH user must be able to run Docker commands. The server must already have Docker and Docker Compose installed.

---

## Files Modified
- ✅ `frontend/Dockerfile` → Created
- ✅ `src/main/resources/application.properties` → Fixed DB URL
- ✅ `docker-compose.yml` → Corrected paths


