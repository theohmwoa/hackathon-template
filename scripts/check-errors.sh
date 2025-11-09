#!/bin/bash

# Error Checking Script
# Scans logs for common errors and reports them
# Agents can run this to check if their code has issues

echo "🔍 Checking for errors..."
echo ""

errors_found=false

# Function to check service logs for errors
check_service() {
  service=$1
  echo "Checking ${service}..."

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

# Check critical services
echo "📋 Checking services for errors..."
echo ""

check_service "backend"
check_service "frontend"
check_service "db"
check_service "auth"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ "$errors_found" = true ]; then
  echo "❌ Errors detected! Review the logs above."
  echo ""
  echo "🔧 Debugging tips:"
  echo "  - View full logs: docker-compose logs [service-name]"
  echo "  - Restart service: docker-compose restart [service-name]"
  echo "  - Rebuild: docker-compose up -d --build [service-name]"
  echo ""
  exit 1
else
  echo "✅ No errors detected! All services running smoothly."
  echo ""
  exit 0
fi
