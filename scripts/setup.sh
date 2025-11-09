#!/bin/bash

# Initial setup script for the Collabolt template
# This script installs dependencies and sets up the environment

set -e  # Exit on any error

echo "🚀 Setting up Collabolt Template..."
echo ""

# Step 1: Generate secrets
echo "📋 Step 1: Generating secure secrets..."
if [ ! -f .env ]; then
  ./scripts/generate-secrets.sh
  echo "✅ Secrets generated and .env created"
else
  echo "ℹ️  .env file already exists, skipping secret generation..."
  echo "⚠️  If you want to regenerate secrets, delete .env and run this script again"
fi
echo ""

# Step 2: Install backend dependencies
echo "📦 Step 2: Installing backend dependencies..."
cd backend
if [ -f package.json ]; then
  npm install
  echo "✅ Backend dependencies installed!"
else
  echo "⚠️  No package.json found in backend folder"
fi
cd ..
echo ""

# Step 3: Install frontend dependencies
echo "📦 Step 3: Installing frontend dependencies..."
cd frontend
if [ -f package.json ]; then
  npm install
  echo "✅ Frontend dependencies installed!"
else
  echo "⚠️  No package.json found in frontend folder"
fi
cd ..
echo ""

echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "  1. Review and update .env file with your configuration"
echo "  2. Start the services: docker-compose up -d"
echo "  3. Generate API types: ./scripts/generate-all.sh"
echo "  4. Access the applications:"
echo "     - Frontend: http://localhost:4200"
echo "     - Backend API: http://localhost:3333"
echo "     - Backend Swagger: http://localhost:3333/api"
echo "     - Supabase Studio: http://localhost:3000"
echo ""
