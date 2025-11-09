# 🚀 Collabolt Quick Start

Zero-friction deployment guide for your AI-generated full-stack application.

## 📦 One-Command Setup

```bash
cd template
./scripts/setup.sh
```

This will:
- ✅ Generate secure secrets automatically
- ✅ Install backend dependencies (NestJS)
- ✅ Install frontend dependencies (Angular)
- ✅ Create `.env` file with all configuration

## 🏃 Start Development

```bash
docker-compose up -d
```

That's it! Your app is now running:
- 🌐 Frontend: http://localhost:4200
- 🔌 Backend: http://localhost:3333
- 📚 API Docs: http://localhost:3333/api
- 🗄️ Supabase Studio: http://localhost:3000

## 🤖 AI Agent Workflow

When your agents generate code:

### 1. Database Agent
Creates SQL files in `database/init/`

### 2. Backend Agent
After creating NestJS modules:
```bash
cd backend
npm run generate:openapi
```

### 3. Frontend Agent
After backend is ready:
```bash
cd frontend
npm run generate:api
```

Or run both at once:
```bash
./scripts/generate-all.sh
```

## 🌍 Deploy to VPS

### Prerequisites on VPS
```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### Deploy
```bash
# Copy template to VPS
scp -r template/ user@your-vps:/opt/collabolt/

# SSH into VPS
ssh user@your-vps
cd /opt/collabolt/template

# Update domain in .env
nano .env
# Set: DOMAIN=yourdomain.com

# Deploy
./scripts/deploy-vps.sh
```

## 🔧 Common Commands

```bash
# View logs
docker-compose logs -f

# Restart a service
docker-compose restart backend

# Stop everything
docker-compose down

# Rebuild and restart
docker-compose up -d --build

# Check service status
docker-compose ps
```

## 🆘 Troubleshooting

### Services won't start
```bash
docker-compose down -v
docker-compose up -d
```

### Regenerate secrets
```bash
rm .env
./scripts/generate-secrets.sh
```

### Database connection issues
```bash
# Check database is running
docker-compose ps db

# View database logs
docker-compose logs db
```

### TypeScript generation fails
```bash
# Backend must generate OpenAPI first
cd backend && npm run generate:openapi

# Then frontend can generate types
cd ../frontend && npm run generate:api
```

## 📁 Quick Reference

| What | Where |
|------|-------|
| Database schemas | `database/init/*.sql` |
| Backend modules | `backend/src/` |
| Frontend components | `frontend/src/app/features/` |
| Generated API types | `frontend/src/@api/types.ts` |
| Environment config | `.env` |
| OpenAPI spec | `backend/openapi.json` |

## 🎯 Next Steps

1. **For Local Development:**
   - Start coding in `backend/src/` and `frontend/src/`
   - Hot reload is enabled for both

2. **For Production:**
   - Set up reverse proxy (nginx/traefik)
   - Configure SSL with Let's Encrypt
   - Update `.env` with production URLs
   - Set up monitoring and backups

3. **For Continuous Deployment:**
   - Add GitHub Actions workflow
   - Configure automated backups
   - Set up health checks

---

Need help? Check `README.md` for detailed documentation or `AGENTS.md` for AI agent system details.
