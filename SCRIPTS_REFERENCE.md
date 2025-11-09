# 🔧 Scripts Quick Reference

All scripts for VPS-first workflow.

---

## 📋 Script Summary

| Script | Run When | Purpose | Exit Code |
|--------|----------|---------|-----------|
| **setup.sh** | First time on VPS | Generate secrets + install deps | Always 0 |
| **first-run.sh** | After agents finish coding | Start all services | 0 if healthy |
| **check-errors.sh** | After services start | Detect errors in logs | 0=OK, 1=Errors |
| **monitor.sh** | During development | Live error stream | N/A |
| **generate-all.sh** | When API changes | OpenAPI + TS types | Always 0 |
| **generate-secrets.sh** | (Called by setup.sh) | Generate .env secrets | Always 0 |
| **deploy-vps.sh** | Manual deployment | Full VPS deployment | 0 if healthy |

---

## 1️⃣ setup.sh

**When:** First time on fresh VPS

**What it does:**
- Generates secure secrets (.env)
- Installs backend dependencies
- Installs frontend dependencies

**Usage:**
```bash
cd /opt/app
./scripts/setup.sh
```

**Output:**
```
🚀 Setting up Collabolt Template...

📋 Step 1: Generating secure secrets...
✅ Secrets generated and .env created

📦 Step 2: Installing backend dependencies...
✅ Backend dependencies installed!

📦 Step 3: Installing frontend dependencies...
✅ Frontend dependencies installed!

🎉 Setup complete!
```

---

## 2️⃣ first-run.sh

**When:** After all agents finish coding

**What it does:**
- Installs any new dependencies
- Starts Docker services
- Waits for services to start
- Runs health checks
- Reports status

**Usage:**
```bash
cd /opt/app
./scripts/first-run.sh
```

**Output:**
```
🚀 Collabolt First Run
=====================

📦 Installing dependencies...
✅ Dependencies installed!

🐳 Starting Docker services...
⏳ Waiting for services to start...

🏥 Health Check:
================
  ✅ db - Running
  ✅ auth - Running
  ✅ backend - Running
  ✅ frontend - Running

📊 Service URLs:
================
  Frontend:  http://localhost:4200
  Backend:   http://localhost:3333
  Swagger:   http://localhost:3333/api
  Supabase:  http://localhost:3000

✅ All services started successfully!

📝 Next steps:
  - Check logs: ./scripts/check-errors.sh
```

---

## 3️⃣ check-errors.sh

**When:** After first-run.sh, or after agents fix code

**What it does:**
- Scans last 50 lines of logs from each service
- Looks for error patterns
- Returns exit code 0 (no errors) or 1 (errors found)
- Displays error details

**Usage:**
```bash
cd /opt/app
./scripts/check-errors.sh
echo $?  # Check exit code
```

**Output (No Errors):**
```
🔍 Checking for errors...

📋 Checking services for errors...

Checking backend...
  ✅ No errors in backend
Checking frontend...
  ✅ No errors in frontend
Checking db...
  ✅ No errors in db
Checking auth...
  ✅ No errors in auth

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ No errors detected! All services running smoothly.
```

**Exit Code:** 0

**Output (Errors Found):**
```
🔍 Checking for errors...

📋 Checking services for errors...

Checking backend...
  ⚠️  Errors found in backend:
     Error: Cannot find module './posts/posts.module'
     at Function.Module._resolveFilename (node:internal/modules/cjs/loader:933:15)

Checking frontend...
  ✅ No errors in frontend

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

❌ Errors detected! Review the logs above.

🔧 Debugging tips:
  - View full logs: docker-compose logs [service-name]
  - Restart service: docker-compose restart [service-name]
```

**Exit Code:** 1

**Automation Example:**
```bash
# In your system:
if ./scripts/check-errors.sh; then
  echo "✅ Success! App is ready"
  notify_user_app_ready
else
  echo "❌ Errors found, sending to agents"
  errors=$(./scripts/check-errors.sh 2>&1)
  send_to_agent "$errors"
fi
```

---

## 4️⃣ monitor.sh

**When:** During active development to watch for errors

**What it does:**
- Follows logs in real-time
- Filters for error patterns
- Displays with timestamp

**Usage:**
```bash
cd /opt/app
./scripts/monitor.sh
# Press Ctrl+C to stop
```

**Output:**
```
📡 Live Error Monitoring
=======================
Monitoring: backend, frontend, db, auth
Press Ctrl+C to stop

⚠️  10:45:23 - backend   | Error: Cannot find module './posts/posts.module'
⚠️  10:45:24 - backend   | TypeError: posts is not defined
⚠️  10:46:10 - frontend  | Error: NullInjectorError: No provider for HttpClient
```

---

## 5️⃣ generate-all.sh

**When:** After backend creates new modules, or API changes

**What it does:**
- Runs `npm run generate:openapi` in backend
- Runs `npm run generate:api` in frontend
- Creates backend/openapi.json
- Creates frontend/src/@api/types.ts

**Usage:**
```bash
cd /opt/app
./scripts/generate-all.sh
```

**Output:**
```
🚀 Starting API generation workflow...

📋 Step 1: Generating OpenAPI specification from backend...
✅ OpenAPI spec generated!

🔧 Step 2: Generating TypeScript types for frontend...
✅ TypeScript types generated!

🎉 All done! Your API types are ready to use.

Next steps:
  - Check backend/openapi.json for the generated OpenAPI spec
  - Check frontend/src/@api/types.ts for the generated TypeScript types
```

---

## 6️⃣ generate-secrets.sh

**When:** Called automatically by setup.sh (or manually to regenerate)

**What it does:**
- Generates 32-char database password
- Generates 64-char JWT secret
- Generates 64-char secret key base
- Creates .env file with all values

**Usage:**
```bash
cd /opt/app
./scripts/generate-secrets.sh
```

**Output:**
```
🔐 Generating secure secrets for Collabolt...

✅ Secrets generated successfully!

📝 Created .env file with:
   - Database password: AbCd1234...
   - JWT secret: XyZ9876...
   - Secret key base: MnOp5432...

⚠️  IMPORTANT: Keep this file secure and never commit it to git!

For production deployment on VPS:
1. Update DOMAIN in .env
2. Update API_EXTERNAL_URL and SITE_URL
3. Configure SMTP settings for email auth
```

---

## 7️⃣ deploy-vps.sh

**When:** Manual full deployment/redeployment

**What it does:**
- Checks Docker is installed
- Validates .env exists
- Pulls Docker images
- Stops existing containers
- Rebuilds and starts containers
- Verifies service health

**Usage:**
```bash
cd /opt/app
./scripts/deploy-vps.sh
```

**Output:**
```
🚀 Collabolt VPS Deployment Script
==================================

📋 Pre-deployment checklist:
✅ Docker is installed
✅ Docker Compose is installed

🔧 Configuration:
   Domain: yourdomain.com
   Frontend URL: https://yourdomain.com
   API URL: https://api.yourdomain.com

Do you want to proceed with deployment? (y/N) y

🏗️  Starting deployment...
[deployment process...]

✅ Deployment complete!
```

---

## 🔄 VPS Workflow with Scripts

```bash
# 1. Copy template to VPS
scp -r template/ root@vps:/opt/app/

# 2. First-time setup
ssh root@vps "cd /opt/app && ./scripts/setup.sh"

# 3. Agents code on VPS (your system)
# ...

# 4. After agents finish
ssh root@vps "cd /opt/app && ./scripts/first-run.sh"

# 5. Check for errors
ssh root@vps "cd /opt/app && ./scripts/check-errors.sh"
if [ $? -eq 0 ]; then
  echo "Success!"
else
  echo "Errors found - iterate"
fi

# 6. (Optional) Live monitoring
ssh root@vps "cd /opt/app && ./scripts/monitor.sh"
```

---

## 🎯 Error Checking Integration

### **JavaScript Example:**

```javascript
const { exec } = require('child_process');

async function checkForErrors(vpsIp) {
  return new Promise((resolve, reject) => {
    exec(
      `ssh root@${vpsIp} "cd /opt/app && ./scripts/check-errors.sh"`,
      (error, stdout, stderr) => {
        if (error) {
          // Exit code 1 = errors found
          reject({
            hasErrors: true,
            output: stdout,
            errors: parseErrors(stdout)
          });
        } else {
          // Exit code 0 = success
          resolve({
            hasErrors: false,
            message: 'All services running smoothly'
          });
        }
      }
    );
  });
}

// Usage:
try {
  await checkForErrors('192.168.1.100');
  console.log('✅ App is ready!');
} catch (err) {
  console.log('❌ Errors:', err.errors);
  // Send to agents for fixing
}
```

---

## 📞 Quick Reference

**Setup new VPS:**
```bash
./scripts/setup.sh
```

**Start services:**
```bash
./scripts/first-run.sh
```

**Check for errors:**
```bash
./scripts/check-errors.sh
# Exit 0 = OK, Exit 1 = Errors
```

**Live monitoring:**
```bash
./scripts/monitor.sh
```

**Regenerate API types:**
```bash
./scripts/generate-all.sh
```

**View logs:**
```bash
docker-compose logs -f [service-name]
```

**Restart service:**
```bash
docker-compose restart [service-name]
```

**Stop everything:**
```bash
docker-compose down
```
