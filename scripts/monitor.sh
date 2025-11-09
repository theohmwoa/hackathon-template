#!/bin/bash

# Live Monitoring Script
# Continuously monitors logs for errors
# Press Ctrl+C to stop

echo "📡 Live Error Monitoring"
echo "======================="
echo "Monitoring: backend, frontend, db, auth"
echo "Press Ctrl+C to stop"
echo ""

# Follow logs and filter for errors
docker-compose logs -f backend frontend db auth 2>&1 | grep -i --line-buffered "error\|exception\|failed\|fatal\|panic" | while read line; do
  echo "⚠️  $(date '+%H:%M:%S') - $line"
done
