#!/bin/bash

# First Run Script - After agents finish coding
# This script starts services and monitors for errors

set -e

echo "🚀 Collabolt First Run"
echo "====================="
echo ""

# Check if .env exists
if [ ! -f .env ]; then
  echo "⚙️  Generating secrets..."
  ./scripts/generate-secrets.sh
fi

echo "📦 Installing dependencies..."
echo ""

# Install backend dependencies
echo "📦 Backend dependencies..."
cd backend
npm install --silent
cd ..

# Install frontend dependencies
echo "📦 Frontend dependencies..."
cd frontend
npm install --silent
cd ..

echo ""
echo "✅ Dependencies installed!"
echo ""

# Start services
echo "🐳 Starting Docker services..."
docker-compose up -d

echo ""
echo "⏳ Waiting for services to start..."
sleep 10

echo ""
echo "🏥 Health Check:"
echo "================"
echo ""

# Check each service
services=("db" "auth" "backend" "frontend")
all_healthy=true

for service in "${services[@]}"; do
  if docker-compose ps | grep -q "${service}.*Up"; then
    echo "  ✅ ${service} - Running"
  else
    echo "  ❌ ${service} - Failed"
    all_healthy=false
  fi
done

echo ""
echo "📊 Service URLs:"
echo "================"
echo "  Frontend:  http://localhost:4200"
echo "  Backend:   http://localhost:3333"
echo "  Swagger:   http://localhost:3333/api"
echo "  Supabase:  http://localhost:3000"
echo ""

if [ "$all_healthy" = true ]; then
  echo "✅ All services started successfully!"
  echo ""
  echo "📝 Next steps:"
  echo "  - Check logs: ./scripts/check-errors.sh"
  echo "  - View logs: docker-compose logs -f"
  echo "  - Stop: docker-compose down"
else
  echo "⚠️  Some services failed to start!"
  echo ""
  echo "🔍 Debugging:"
  echo "  - View all logs: docker-compose logs"
  echo "  - Check specific service: docker-compose logs [service-name]"
  echo "  - Restart: docker-compose restart [service-name]"
fi

echo ""
