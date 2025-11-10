#!/bin/bash

# Error Checking Script
# Scans logs for common errors and reports them
# Checks both PM2 processes (backend/frontend) and Docker services (Supabase)

echo "🔍 Checking for errors..."
echo ""

errors_found=false

# Function to check PM2 process logs
check_pm2_process() {
  process=$1
  echo "Checking PM2 process: ${process}..."

  # Check if PM2 is running
  if ! command -v pm2 &> /dev/null; then
    echo "  ⚠️  PM2 is not installed"
    return
  fi

  # Check if process exists
  if ! pm2 list | grep -q "${process}"; then
    echo "  ⚠️  Process ${process} is not running in PM2"
    errors_found=true
    return
  fi

  # Get last 50 lines of logs
  logs=$(pm2 logs ${process} --nostream --lines 50 2>&1 || echo "")

  # Check for common error patterns
  if echo "$logs" | grep -iq "error\|exception\|failed\|fatal\|panic\|cannot find module\|econnrefused"; then
    echo "  ⚠️  Errors found in ${process}:"
    echo "$logs" | grep -i "error\|exception\|failed\|fatal\|panic\|cannot find module\|econnrefused" | tail -5 | sed 's/^/     /'
    echo ""
    errors_found=true
  else
    echo "  ✅ No errors in ${process}"
  fi
}

# Function to check Docker service logs
check_docker_service() {
  service=$1
  echo "Checking Docker service: ${service}..."

  # Check if service exists and is running
  if ! docker-compose ps | grep -q "${service}"; then
    echo "  ⚠️  Service ${service} is not in docker-compose"
    return
  fi

  # Get last 50 lines of logs
  logs=$(docker-compose logs --tail=50 ${service} 2>&1)

  # Check for common error patterns
  if echo "$logs" | grep -iq "error\|exception\|failed\|fatal\|panic"; then
    echo "  ⚠️  Errors found in ${service}:"
    echo "$logs" | grep -i "error\|exception\|failed\|fatal\|panic" | tail -5 | sed 's/^/     /'
    echo ""
    errors_found=true
  else
    echo "  ✅ No errors in ${service}"
  fi
}

# Check PM2 processes (backend & frontend)
echo "📋 Checking PM2 processes..."
echo ""

check_pm2_process "backend"
check_pm2_process "frontend"

echo ""
echo "📋 Checking Docker services (Supabase)..."
echo ""

check_docker_service "db"
check_docker_service "auth"
check_docker_service "rest"
check_docker_service "realtime"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ "$errors_found" = true ]; then
  echo "❌ Errors detected! Review the logs above."
  echo ""
  echo "🔧 Debugging tips:"
  echo ""
  echo "  PM2 processes:"
  echo "    - View logs: pm2 logs [backend|frontend]"
  echo "    - Restart: pm2 restart [backend|frontend]"
  echo "    - Status: pm2 status"
  echo ""
  echo "  Docker services:"
  echo "    - View logs: docker-compose logs [service-name]"
  echo "    - Restart: docker-compose restart [service-name]"
  echo ""
  exit 1
else
  echo "✅ No errors detected! All services running smoothly."
  echo ""
  exit 0
fi
