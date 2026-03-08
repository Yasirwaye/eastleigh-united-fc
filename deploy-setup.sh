#!/bin/bash

# Eastleigh United Academy - Production Deployment Script
# This script helps set up production environment variables

echo "🚀 Eastleigh United Academy - Production Setup"
echo "=============================================="

# Generate secure secret key
echo "Generating secure SECRET_KEY..."
SECRET_KEY=$(python3 -c "import secrets; print(secrets.token_hex(32))")
echo "SECRET_KEY=$SECRET_KEY"

# Generate secure database password
echo "Generating secure database password..."
DB_PASSWORD=$(python3 -c "import secrets; print(secrets.token_hex(16))")
echo "POSTGRES_PASSWORD=$DB_PASSWORD"

echo ""
echo "📋 Copy these environment variables to your hosting platform:"
echo ""
echo "SECRET_KEY=$SECRET_KEY"
echo "POSTGRES_PASSWORD=$DB_PASSWORD"
echo "REACT_APP_API_URL=https://your-backend-url"
echo "REACT_APP_ADMIN_USERNAME=admin"
echo "REACT_APP_ADMIN_PASSWORD=your-secure-admin-password"
echo ""
echo "⚠️  IMPORTANT: Change the admin password from the default!"
echo "🔗 Update REACT_APP_API_URL with your actual backend URL"
echo ""
echo "Ready to deploy! 🎉"