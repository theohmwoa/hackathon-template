#!/bin/bash

# Script to generate OpenAPI spec and TypeScript types
# This orchestrates the full workflow

set -e  # Exit on any error

echo "🚀 Starting API generation workflow..."
echo ""

# Step 1: Generate OpenAPI spec from NestJS backend
echo "📋 Step 1: Generating OpenAPI specification from backend..."
cd backend
npm run generate:openapi
echo "✅ OpenAPI spec generated!"
echo ""

# Step 2: Generate TypeScript types for Angular frontend
echo "🔧 Step 2: Generating TypeScript types for frontend..."
cd ../frontend
npm run generate:api
echo "✅ TypeScript types generated!"
echo ""

echo "🎉 All done! Your API types are ready to use."
echo ""
echo "Next steps:"
echo "  - Check backend/openapi.json for the generated OpenAPI spec"
echo "  - Check frontend/src/@api/types.ts for the generated TypeScript types"
echo "  - Import types in your Angular components: import { components } from '@api/types';"
echo ""
