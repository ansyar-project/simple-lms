# Docker Setup for LMS Application

This directory contains Docker configuration files for running the LMS application in containerized environments.

## Files Overview

- `Dockerfile` - Multi-stage Docker build configuration
- `docker-compose.yml` - Production deployment with all services
- `docker-compose.dev.yml` - Development environment
- `.dockerignore` - Files to exclude from Docker build context
- `healthcheck.js` - Health check script for container monitoring
- `.env.docker` - Environment variables template for Docker

## Quick Start

### Development Environment

1. **Start development environment:**

   ```bash
   docker-compose -f docker-compose.dev.yml up -d
   ```

2. **View logs:**

   ```bash
   docker-compose -f docker-compose.dev.yml logs -f app-dev
   ```

3. **Stop services:**
   ```bash
   docker-compose -f docker-compose.dev.yml down
   ```

### Production Environment

1. **Create environment file:**

   ```bash
   cp .env.docker .env
   # Edit .env with your production values
   ```

2. **Build and start services:**

   ```bash
   docker-compose up -d
   ```

3. **Run database migrations:**
   ```bash
   docker-compose exec app pnpm db:migrate
   docker-compose exec app pnpm db:seed
   ```

## Services

### Application (Next.js)

- **Port:** 3000
- **Health Check:** `/api/health`
- **Dependencies:** PostgreSQL, Redis, MinIO

### PostgreSQL Database

- **Port:** 5432
- **Database:** lms_db
- **User:** lms_user
- **Volume:** postgres_data

### Redis Cache

- **Port:** 6379
- **Volume:** redis_data

### MinIO Object Storage

- **Port:** 9000 (API), 9001 (Console)
- **Console:** http://localhost:9001
- **Credentials:** minioadmin/minioadmin
- **Volume:** minio_data

## Environment Variables

### Required Variables

```bash
DATABASE_URL=postgresql://user:password@host:port/database
REDIS_URL=redis://host:port
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=https://your-domain.com
MINIO_ENDPOINT=minio:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
```

### Optional Variables

```bash
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
MAX_FILE_SIZE=10485760
```

## Docker Commands

### Build Application Only

```bash
docker build -t lms-app .
```

### Run Single Container

```bash
docker run -p 3000:3000 --env-file .env lms-app
```

### View Container Logs

```bash
docker logs -f container_name
```

### Execute Commands in Container

```bash
docker-compose exec app pnpm db:migrate
docker-compose exec app pnpm db:studio
```

### Clean Up

```bash
# Stop and remove containers
docker-compose down

# Remove volumes (WARNING: This will delete all data!)
docker-compose down -v

# Remove images
docker-compose down --rmi all
```

## Production Deployment

### Security Considerations

1. **Change Default Passwords:**

   - Update PostgreSQL credentials
   - Change MinIO access keys
   - Generate strong NEXTAUTH_SECRET

2. **Environment Variables:**

   - Never commit .env files to version control
   - Use secure secret management in production

3. **Network Security:**
   - Use reverse proxy (nginx/traefik)
   - Enable HTTPS
   - Restrict port access

### Example Production Deployment

```bash
# 1. Prepare environment
cp .env.docker .env
nano .env  # Update all credentials

# 2. Deploy with docker-compose
docker-compose up -d

# 3. Run migrations
docker-compose exec app pnpm db:migrate

# 4. Verify deployment
curl http://localhost:3000/api/health
```

### Scaling

For production scaling, consider:

1. **Database:** Use managed PostgreSQL (AWS RDS, Google Cloud SQL)
2. **Cache:** Use managed Redis (AWS ElastiCache, Google Memorystore)
3. **Storage:** Use cloud object storage (AWS S3, Google Cloud Storage)
4. **Container Orchestration:** Kubernetes or Docker Swarm

## Troubleshooting

### Common Issues

1. **Port Already in Use:**

   ```bash
   # Check what's using the port
   netstat -tulpn | grep :3000
   # Or change port in docker-compose.yml
   ```

2. **Database Connection Failed:**

   ```bash
   # Check if PostgreSQL is running
   docker-compose ps postgres
   # View PostgreSQL logs
   docker-compose logs postgres
   ```

3. **Application Won't Start:**

   ```bash
   # Check application logs
   docker-compose logs app
   # Verify environment variables
   docker-compose exec app env | grep DATABASE_URL
   ```

4. **File Uploads Not Working:**
   ```bash
   # Check MinIO status
   docker-compose ps minio
   # Access MinIO console at http://localhost:9001
   ```

### Health Checks

- **Application:** `curl http://localhost:3000/api/health`
- **Database:** `docker-compose exec postgres pg_isready`
- **Redis:** `docker-compose exec redis redis-cli ping`
- **MinIO:** `curl http://localhost:9000/minio/health/live`

## Development Tips

1. **Live Reload:** Development container supports hot reload
2. **Database Changes:** Run migrations in container: `docker-compose exec app pnpm db:migrate`
3. **Prisma Studio:** Access at `docker-compose exec app pnpm db:studio`
4. **File Permissions:** Use non-root user in containers for security

## Performance Optimization

### Image Size

- Multi-stage build reduces final image size
- Alpine Linux base for minimal footprint
- Production builds exclude dev dependencies

### Runtime Performance

- Health checks ensure container reliability
- Proper signal handling for graceful shutdowns
- Optimized layer caching for faster builds

### Resource Limits

Add resource limits in production:

```yaml
services:
  app:
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: "0.5"
        reservations:
          memory: 256M
          cpus: "0.25"
```
