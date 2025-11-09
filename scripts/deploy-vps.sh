#!/bin/bash

# VPS Deployment Script for Collabolt
# This script deploys the application to a VPS using Docker Compose

set -e

echo "🚀 Collabolt VPS Deployment Script"
echo "=================================="
echo ""

# Check if .env exists
if [ ! -f .env ]; then
  echo "❌ Error: .env file not found!"
  echo ""
  echo "Please run './scripts/generate-secrets.sh' first to generate secrets."
  exit 1
fi

# Check if running on VPS (optional check)
echo "📋 Pre-deployment checklist:"
echo ""

# Check Docker
if ! command -v docker &> /dev/null; then
  echo "❌ Docker is not installed!"
  echo "Please install Docker first: https://docs.docker.com/engine/install/"
  exit 1
fi
echo "✅ Docker is installed"

# Check Docker Compose
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
  echo "❌ Docker Compose is not installed!"
  echo "Please install Docker Compose first"
  exit 1
fi
echo "✅ Docker Compose is installed"

echo ""
echo "🔧 Configuration:"
source .env
echo "   Domain: ${DOMAIN:-localhost}"
echo "   Frontend URL: ${SITE_URL}"
echo "   API URL: ${API_EXTERNAL_URL}"
echo ""

# Ask for confirmation
read -p "Do you want to proceed with deployment? (y/N) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "Deployment cancelled."
  exit 1
fi

echo ""
echo "🏗️  Starting deployment..."
echo ""

# Pull latest images
echo "📦 Pulling Docker images..."
docker-compose pull

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker-compose down

# Build and start containers
echo "🚀 Building and starting containers..."
docker-compose up -d --build

# Wait for services to be healthy
echo ""
echo "⏳ Waiting for services to be healthy..."
sleep 10

# Check service health
echo ""
echo "🏥 Checking service health..."

services=("db" "backend" "frontend")
for service in "${services[@]}"; do
  if docker-compose ps | grep -q "${service}.*Up"; then
    echo "  ✅ ${service} is running"
  else
    echo "  ❌ ${service} is not running"
  fi
done

echo ""
echo "📊 Service Status:"
docker-compose ps

echo ""
echo "✅ Deployment complete!"
echo ""
echo "🌐 Your application is now accessible at:"
echo "   Frontend: ${SITE_URL}"
echo "   Backend API: ${API_EXTERNAL_URL}"
echo "   Swagger Docs: ${API_EXTERNAL_URL}/api"
echo "   Supabase Studio: http://${DOMAIN:-localhost}:3000"
echo ""
echo "📝 Useful commands:"
echo "   View logs: docker-compose logs -f"
echo "   Restart: docker-compose restart"
echo "   Stop: docker-compose down"
echo ""
echo "⚠️  Next steps:"
echo "   1. Set up reverse proxy (nginx/traefik) for SSL"
echo "   2. Configure DNS to point to this server"
echo "   3. Set up SSL certificates (Let's Encrypt)"
echo "   4. Configure firewall rules"
echo ""
