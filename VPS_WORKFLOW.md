# 🌍 VPS-First Workflow - How Collabolt Works

## The Lovable-Like Approach

This template is designed for **VPS-first deployment** where AI agents code directly on the server.

---

## 🔄 Complete Workflow

### **Step 1: User Creates Project**
User provides requirements through your UI:
- Figma link
- Text description
- Feature list

### **Step 2: Copy Template to VPS**
Your system copies this entire `template/` folder to a fresh VPS:

```bash
# Your system does this:
scp -r template/ root@new-vps-ip:/opt/collabolt/app/

# Or via Git:
ssh root@new-vps-ip
cd /opt/collabolt
git clone your-template-repo app/
```

### **Step 3: Initial Setup on VPS**
Run setup script (one command):

```bash
ssh root@vps-ip
cd /opt/collabolt/app
./scripts/setup.sh
```

This auto-generates:
- ✅ Secure secrets (.env)
- ✅ Backend dependencies
- ✅ Frontend dependencies

### **Step 4: Agents Code Directly on VPS**

Your 3 agents connect to the VPS and code:

#### **Agent 1: Database Agent** (2-3 min)
```bash
# Agent creates files on VPS:
database/init/02-posts.sql
database/init/03-comments.sql
DATABASE_SCHEMA.md
```

#### **Agent 2: Backend Agent** (5-10 min)
```bash
# Agent creates files on VPS:
backend/src/posts/* (module, controller, service, DTOs, entities)
backend/src/comments/*

# Agent runs on VPS:
cd backend && npm run generate:openapi

# Agent creates:
backend/openapi.json
BACKEND_API.md
```

#### **Agent 3: Frontend Agent** (10-15 min)
```bash
# Agent runs on VPS:
cd frontend && npm run generate:api

# Agent creates files on VPS:
frontend/src/@api/types.ts
frontend/src/app/features/posts/*
frontend/src/app/features/comments/*
```

### **Step 5: First Run**
After all agents finish coding:

```bash
# Run on VPS:
./scripts/first-run.sh
```

This:
- ✅ Installs any new dependencies
- ✅ Starts all Docker services
- ✅ Runs health checks
- ✅ Reports status

### **Step 6: Monitor for Errors**

#### **Quick Error Check**
```bash
# Run on VPS to scan for errors:
./scripts/check-errors.sh
```

Output example:
```
🔍 Checking for errors...

Checking backend...
  ⚠️  Errors found in backend:
     Error: Cannot find module './posts/posts.module'

Checking frontend...
  ✅ No errors in frontend

❌ Errors detected! Review the logs above.
```

#### **Live Monitoring**
```bash
# Run on VPS for live error monitoring:
./scripts/monitor.sh
```

Streams errors in real-time:
```
📡 Live Error Monitoring
=======================
⚠️  10:45:23 - backend   | Error: Cannot find module './posts/posts.module'
⚠️  10:45:24 - backend   | TypeError: posts is not defined
```

### **Step 7: Agent Fixes Errors (if needed)**

If errors found:
1. Your system parses error output from `check-errors.sh`
2. Sends errors to appropriate agent
3. Agent fixes the code on VPS
4. Run `./scripts/check-errors.sh` again
5. Repeat until no errors

### **Step 8: Application Ready! 🎉**

Once `check-errors.sh` returns ✅:
- Application is running
- No errors detected
- Ready for user access

Update DNS and SSL (if needed):
```bash
# Optional: Your system can configure nginx/SSL
```

---

## 🤖 Agent VPS Access

### **How Agents Connect to VPS**

Your agents need SSH access to the VPS to create files and run commands.

**Option 1: SSH with Key**
```javascript
// Your agent system does this:
const SSH = require('ssh2').Client;

const conn = new SSH();
conn.connect({
  host: vps_ip,
  port: 22,
  username: 'root',
  privateKey: fs.readFileSync('/path/to/key')
});

// Agent can now create files and run commands
```

**Option 2: API Wrapper**
Your system provides an API that agents call:
```javascript
// Agent calls your API:
POST /api/agent/write-file
{
  "vps_id": "123",
  "path": "backend/src/posts/posts.controller.ts",
  "content": "..."
}

POST /api/agent/run-command
{
  "vps_id": "123",
  "command": "cd backend && npm run generate:openapi"
}
```

### **Agent Permissions**

Agents need to:
- ✅ Create/edit files in their respective folders
- ✅ Run npm commands
- ✅ Run the error checking scripts
- ❌ NOT access .env directly (already generated)
- ❌ NOT modify Docker Compose (already configured)

---

## 📊 Error Monitoring for Your System

### **Automated Error Detection**

Your system can automatically monitor using the scripts:

```javascript
// After agents finish iteration
const { exec } = require('child_process');

exec('ssh root@vps-ip "cd /opt/collabolt/app && ./scripts/check-errors.sh"',
  (error, stdout, stderr) => {
    if (error) {
      // Exit code 1 = errors found
      const errors = stdout; // Contains error details

      // Parse errors and send to appropriate agent
      if (errors.includes('backend')) {
        sendToBackendAgent(errors);
      }
      if (errors.includes('frontend')) {
        sendToFrontendAgent(errors);
      }
    } else {
      // Exit code 0 = no errors, app is ready!
      markApplicationAsReady();
    }
  }
);
```

### **Real-time Monitoring**

For live monitoring during agent work:

```javascript
const { spawn } = require('child_process');

const monitor = spawn('ssh', [
  'root@vps-ip',
  'cd /opt/collabolt/app && ./scripts/monitor.sh'
]);

monitor.stdout.on('data', (data) => {
  const error = data.toString();
  console.log('VPS Error:', error);

  // Send to monitoring dashboard or alert agent
  notifyError(error);
});
```

---

## 🎯 Key Scripts for VPS Workflow

| Script | When to Use | What it Does |
|--------|-------------|--------------|
| `setup.sh` | After copying template to VPS | Generate secrets, install deps |
| `first-run.sh` | After agents finish coding | Start services, health check |
| `check-errors.sh` | After first run, after fixes | Scan logs for errors (exit 0/1) |
| `monitor.sh` | During development | Live error streaming |
| `generate-all.sh` | When agents update API | Regenerate types |

---

## ✅ Complete Example Flow

```bash
# 1. Your system: Copy template to VPS
scp -r template/ root@192.168.1.100:/opt/app/

# 2. Your system: Run initial setup
ssh root@192.168.1.100 "cd /opt/app && ./scripts/setup.sh"

# 3. Database Agent: Creates SQL files on VPS
# (via your API or SSH)

# 4. Backend Agent: Creates NestJS modules on VPS
# Agent runs: cd backend && npm run generate:openapi

# 5. Frontend Agent: Creates Angular components on VPS
# Agent runs: cd frontend && npm run generate:api

# 6. Your system: First run
ssh root@192.168.1.100 "cd /opt/app && ./scripts/first-run.sh"

# 7. Your system: Check for errors
ssh root@192.168.1.100 "cd /opt/app && ./scripts/check-errors.sh"
# Exit code 0 = success!
# Exit code 1 = errors found, iterate

# 8. If errors: Send to agent, agent fixes, repeat step 7

# 9. Success! Application is running
```

---

## 🚀 Performance Metrics

With this VPS-first approach:

- **Setup time:** ~2 minutes (one script)
- **Database agent:** 2-3 minutes
- **Backend agent:** 5-10 minutes (includes OpenAPI generation)
- **Frontend agent:** 10-15 minutes (includes type generation)
- **First run:** ~1 minute
- **Error check:** ~10 seconds

**Total: ~20-35 minutes from zero to deployed app!**

---

## 💡 Best Practices

### **For Your System**

1. ✅ Always run `setup.sh` first on fresh VPS
2. ✅ Wait for each agent to complete before starting next
3. ✅ Run `check-errors.sh` after each major change
4. ✅ Parse error output to send to correct agent
5. ✅ Set max iteration limit (e.g., 3 tries to fix errors)
6. ✅ Keep logs of all agent actions for debugging

### **For Agents**

1. ✅ Always create `DATABASE_SCHEMA.md` → `BACKEND_API.md` handoff docs
2. ✅ Run generation scripts after creating modules
3. ✅ Use `check-errors.sh` to verify their work
4. ✅ Import types from `@api/types` in frontend
5. ✅ Add proper error handling in all code
6. ✅ Create comprehensive tests

---

## 🎊 Result

You have a **VPS-first template** that:

- ✅ Deploys in minutes on fresh VPS
- ✅ Agents code directly on server
- ✅ Automatic error detection
- ✅ Iterative fixing workflow
- ✅ Zero manual configuration
- ✅ Production-ready from start

**Perfect for your Lovable-like platform!** 🚀
