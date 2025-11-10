#!/bin/bash

# Live Monitoring Script
# Continuously monitors logs from PM2 and Docker
# Press Ctrl+C to stop

echo "📡 Live Monitoring"
echo "=================="
echo ""
echo "Choose monitoring mode:"
echo "  1) PM2 logs only (backend & frontend)"
echo "  2) Docker logs only (Supabase services)"
echo "  3) Both PM2 and Docker"
echo "  4) PM2 interactive dashboard (pm2 monit)"
echo "  5) Errors only (both PM2 and Docker)"
echo ""
read -p "Select option [1-5]: " -n 1 -r
echo ""
echo ""

case $REPLY in
  1)
    echo "📊 Monitoring PM2 processes (backend & frontend)"
    echo "Press Ctrl+C to stop"
    echo ""
    pm2 logs
    ;;
  2)
    echo "🐳 Monitoring Docker services (Supabase)"
    echo "Press Ctrl+C to stop"
    echo ""
    docker-compose logs -f db auth rest realtime
    ;;
  3)
    echo "📊 Monitoring all services (PM2 + Docker)"
    echo "Press Ctrl+C to stop"
    echo ""
    echo "Opening PM2 logs in background..."
    echo "Opening Docker logs in background..."
    echo ""

    # Run both in parallel using process substitution
    (pm2 logs --raw | sed 's/^/[PM2] /') &
    PM2_PID=$!

    (docker-compose logs -f db auth rest realtime 2>&1 | sed 's/^/[DOCKER] /') &
    DOCKER_PID=$!

    # Wait for both processes
    trap "kill $PM2_PID $DOCKER_PID 2>/dev/null; exit" SIGINT SIGTERM
    wait
    ;;
  4)
    echo "📊 Launching PM2 interactive dashboard..."
    echo ""
    pm2 monit
    ;;
  5)
    echo "⚠️  Monitoring errors only (PM2 + Docker)"
    echo "Press Ctrl+C to stop"
    echo ""

    # Monitor PM2 for errors
    (pm2 logs --raw | grep -i --line-buffered "error\|exception\|failed\|fatal\|panic\|cannot find module" | sed 's/^/[PM2] /' | while read line; do
      echo "⚠️  $(date '+%H:%M:%S') - $line"
    done) &
    PM2_PID=$!

    # Monitor Docker for errors
    (docker-compose logs -f db auth rest realtime 2>&1 | grep -i --line-buffered "error\|exception\|failed\|fatal\|panic" | sed 's/^/[DOCKER] /' | while read line; do
      echo "⚠️  $(date '+%H:%M:%S') - $line"
    done) &
    DOCKER_PID=$!

    # Wait for both processes
    trap "kill $PM2_PID $DOCKER_PID 2>/dev/null; exit" SIGINT SIGTERM
    wait
    ;;
  *)
    echo "Invalid option. Exiting."
    exit 1
    ;;
esac
