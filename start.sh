#!/bin/bash

echo "🚀 Starting Hackathon Template Development Environment"
echo ""

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    echo "⚠️  PM2 is not installed. Installing PM2..."
    npm install -g pm2
fi

# Start Docker services (Supabase)
echo "📦 Starting Supabase services in Docker..."
docker-compose up -d

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 5

# Start backend and frontend with PM2
echo "🔧 Starting Backend and Frontend with PM2..."
pm2 start ecosystem.config.js

echo ""
echo "✅ Development environment is ready!"
echo ""
echo "📊 View logs:"
echo "   All logs:      pm2 logs"
echo "   Backend logs:  pm2 logs backend"
echo "   Frontend logs: pm2 logs frontend"
echo ""
echo "📈 Monitor processes:"
echo "   pm2 monit"
echo ""
echo "🌐 Access points:"
echo "   Frontend:        http://localhost:4200"
echo "   Backend API:     http://localhost:3333"
echo "   Supabase Studio: http://localhost:3000"
echo "   Supabase API:    http://localhost:8000"
echo ""
echo "🛑 To stop everything:"
echo "   ./stop.sh"
echo ""
