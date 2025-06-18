# Production Deployment Checklist

## Pre-Deployment Setup

### 1. Environment Configuration

- [ ] Copy `.env.docker` to `.env` in production
- [ ] Set `NEXTAUTH_URL` to your production domain (e.g., `https://simple-lms.ansyar-world.top`)
- [ ] Generate secure `NEXTAUTH_SECRET` using `openssl rand -base64 32`
- [ ] Update database credentials
- [ ] Configure Redis URL
- [ ] Set MinIO credentials

### 2. NextAuth.js Configuration

- [ ] Verify `NEXTAUTH_URL` matches your exact domain
- [ ] Ensure HTTPS is used in production URLs
- [ ] Test authentication flows after deployment
- [ ] Verify callback URLs are correct

### 3. Database Setup

- [ ] Run database migrations: `docker-compose exec app pnpm db:migrate`
- [ ] Seed initial data: `docker-compose exec app pnpm db:seed`
- [ ] Verify database connectivity

### 4. Security Checklist

- [ ] All default passwords changed
- [ ] SSL/TLS certificates configured
- [ ] Environment variables secured
- [ ] Firewall rules configured
- [ ] Reverse proxy configured (if applicable)

## Deployment Commands

```bash
# 1. Prepare environment
cp .env.docker .env
nano .env  # Update all values

# 2. Deploy services
docker-compose up -d

# 3. Check services
docker-compose ps

# 4. Run migrations
docker-compose exec app pnpm db:migrate

# 5. Seed database (optional)
docker-compose exec app pnpm db:seed

# 6. Check logs
docker-compose logs -f app
```

## Post-Deployment Verification

### 1. Service Health Checks

- [ ] App is running: `curl https://your-domain.com/api/health`
- [ ] Database connected
- [ ] Redis connected
- [ ] MinIO accessible

### 2. Authentication Testing

- [ ] Login page loads
- [ ] Email/password authentication works
- [ ] Google OAuth works (if configured)
- [ ] Session persistence works
- [ ] Logout functionality works

### 3. Application Features

- [ ] User registration
- [ ] Course creation (instructor)
- [ ] File uploads work
- [ ] Dashboard access

## Troubleshooting Common Issues

### UntrustedHost Error

```
[auth][error] UntrustedHost: Host must be trusted
```

**Solution:**

1. Verify `NEXTAUTH_URL` in `.env` matches your domain exactly
2. Restart the application: `docker-compose restart app`
3. Check environment variables are loaded: `docker-compose exec app env | grep NEXTAUTH`

### Database Connection Issues

```
Error: Can't connect to database
```

**Solution:**

1. Check database container: `docker-compose ps postgres`
2. Verify DATABASE_URL format: `postgresql://user:pass@postgres:5432/db`
3. Check network connectivity: `docker-compose exec app pg_isready -h postgres`

### File Upload Issues

```
MinIO connection failed
```

**Solution:**

1. Check MinIO container: `docker-compose ps minio`
2. Verify MinIO credentials in `.env`
3. Test connection: `docker-compose exec app curl http://minio:9000/minio/health/live`

## Monitoring & Maintenance

### Regular Tasks

- [ ] Monitor application logs: `docker-compose logs -f app`
- [ ] Check disk usage: `df -h`
- [ ] Monitor container health: `docker-compose ps`
- [ ] Update security patches regularly

### Backup Strategy

- [ ] Database backups configured
- [ ] MinIO data backups configured
- [ ] Environment configuration backed up
- [ ] Restore procedures tested

## Emergency Procedures

### Application Rollback

```bash
# Stop current deployment
docker-compose down

# Deploy previous version
git checkout previous-tag
docker-compose up -d
```

### Database Rollback

```bash
# Restore from backup
docker-compose exec postgres pg_restore -d lms_db backup.sql
```

### Quick Service Restart

```bash
# Restart specific service
docker-compose restart app

# Restart all services
docker-compose restart
```
