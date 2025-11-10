#!/bin/bash

echo "🛑 Stopping Hackathon Template Development Environment"
echo ""

# Stop PM2 processes
echo "⏹️  Stopping Backend and Frontend..."
pm2 stop ecosystem.config.js
pm2 delete ecosystem.config.js

# Stop Docker services
echo "📦 Stopping Supabase services..."
docker-compose down

echo ""
echo "✅ Development environment stopped!"
echo ""
echo "To start again, run: ./start.sh"
echo ""
