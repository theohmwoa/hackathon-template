#!/bin/bash

# Generate secure secrets for the application
# This creates a .env file with all necessary secrets

set -e

echo "🔐 Generating secure secrets for Collabolt..."
echo ""

# Function to generate random string
generate_secret() {
  openssl rand -base64 32 | tr -d "=+/" | cut -c1-${1:-32}
}

# Generate secrets
POSTGRES_PASSWORD=$(generate_secret 32)
SECRET_KEY_BASE=$(generate_secret 64)

# JWT Secret - MUST match the secret used to sign the Supabase demo keys below
# The demo ANON_KEY and SERVICE_KEY are signed with this specific secret
# Do NOT change this unless you also regenerate the JWT keys with a new secret
JWT_SECRET="super-secret-jwt-token-with-at-least-32-characters-long"

# Supabase JWT keys (demo keys for development)
# These are signed with the JWT_SECRET above
# For production: Generate new keys with your own JWT_SECRET using jwt.io or similar
ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0"
SERVICE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU"

# Create .env file
cat > .env << EOF
# Generated secrets - $(date)
# DO NOT COMMIT THIS FILE TO VERSION CONTROL

# ================================
# Database Configuration
# ================================
POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
POSTGRES_DB=postgres

# ================================
# JWT Configuration
# ================================
JWT_SECRET=${JWT_SECRET}
JWT_EXPIRY=3600

# ================================
# Supabase Keys
# ================================
SUPABASE_ANON_KEY=${ANON_KEY}
SUPABASE_SERVICE_KEY=${SERVICE_KEY}

# ================================
# API URLs (Update these for production)
# ================================
API_EXTERNAL_URL=http://localhost:8000
SITE_URL=http://localhost:4200

# ================================
# Auth Configuration
# ================================
DISABLE_SIGNUP=false
ENABLE_EMAIL_SIGNUP=true
ENABLE_EMAIL_AUTOCONFIRM=true
ENABLE_PHONE_SIGNUP=false
ENABLE_PHONE_AUTOCONFIRM=false

# ================================
# SMTP Configuration (Optional)
# ================================
SMTP_ADMIN_EMAIL=admin@example.com
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_SENDER_NAME=Collabolt

# ================================
# Additional Configuration
# ================================
ADDITIONAL_REDIRECT_URLS=
PGRST_DB_SCHEMAS=public,storage,graphql_public
SECRET_KEY_BASE=${SECRET_KEY_BASE}
NODE_ENV=production

# ================================
# Domain Configuration (For VPS deployment)
# ================================
DOMAIN=your-domain.com
# Uncomment and set these for production deployment
# API_EXTERNAL_URL=https://api.your-domain.com
# SITE_URL=https://your-domain.com
EOF

echo "✅ Secrets generated successfully!"
echo ""
echo "📝 Created .env file with:"
echo "   - Database password: ${POSTGRES_PASSWORD:0:8}..."
echo "   - JWT secret: ${JWT_SECRET:0:8}..."
echo "   - Secret key base: ${SECRET_KEY_BASE:0:8}..."
echo ""
echo "⚠️  IMPORTANT: Keep this file secure and never commit it to git!"
echo ""
echo "For production deployment on VPS:"
echo "1. Update DOMAIN in .env"
echo "2. Update API_EXTERNAL_URL and SITE_URL"
echo "3. Configure SMTP settings for email auth"
echo ""
