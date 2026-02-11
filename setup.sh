#!/bin/bash

# ===========================================
# MARITIME VESSEL TRACKING - AUTO SETUP SCRIPT
# ===========================================
# This script automatically sets up the project with initial data

set -e  # Exit on error

echo "🚢 Maritime Vessel Tracking - Automated Setup"
echo "=============================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  .env file not found!${NC}"
    echo "📝 Creating .env from .env.example..."
    
    if [ -f .env.example ]; then
        cp .env.example .env
        echo -e "${GREEN}✅ .env file created!${NC}"
        echo -e "${YELLOW}⚠️  Please edit .env and add your API keys before continuing${NC}"
        echo ""
        read -p "Press Enter after you've updated .env with your API keys..."
    else
        echo -e "${RED}❌ .env.example not found! Cannot continue.${NC}"
        exit 1
    fi
fi

echo ""
echo "🔧 Step 1: Installing Python dependencies..."
pip install -r requirements.txt

echo ""
echo "📦 Step 2: Running database migrations..."
python manage.py makemigrations
python manage.py migrate

echo ""
echo "👤 Step 3: Creating superuser..."
echo "Please enter superuser credentials:"
python manage.py createsuperuser --noinput --username admin --email admin@maritime.com || python manage.py createsuperuser

echo ""
echo "📊 Step 4: Importing initial data..."

# Check if data files exist and import them
if [ -d "core/data" ]; then
    echo "  📍 Importing ports..."
    python manage.py import_ports || echo "⚠️  Port import skipped (file not found or already imported)"
    
    echo "  🚢 Importing vessels..."
    python manage.py import_vessels || echo "⚠️  Vessel import skipped (file not found or already imported)"
    
    echo "  🗺️  Importing routes..."
    python manage.py import_routes || echo "⚠️  Route import skipped (file not found or already imported)"
else
    echo -e "${YELLOW}⚠️  No data directory found, skipping data import${NC}"
fi

echo ""
echo "🎨 Step 5: Collecting static files..."
python manage.py collectstatic --noinput

echo ""
echo -e "${GREEN}✅ Backend setup complete!${NC}"
echo ""
echo "=============================================="
echo "📱 Setting up Frontend..."
echo "=============================================="

if [ -d "frontend" ]; then
    cd frontend
    
    echo ""
    echo "📦 Installing Node dependencies..."
    npm install
    
    echo ""
    echo -e "${GREEN}✅ Frontend setup complete!${NC}"
    
    cd ..
else
    echo -e "${YELLOW}⚠️  Frontend directory not found${NC}"
fi

echo ""
echo "=============================================="
echo -e "${GREEN}🎉 Setup Complete!${NC}"
echo "=============================================="
echo ""
echo "To start the application:"
echo ""
echo "Backend:"
echo "  python manage.py runserver"
echo ""
echo "Frontend:"
echo "  cd frontend && npm run dev"
echo ""
echo "AIS Stream (optional):"
echo "  python manage.py stream_ais"
echo ""
echo "Admin Panel: http://localhost:8001/admin"
echo "Frontend: http://localhost:5173"
echo ""
echo -e "${GREEN}Happy tracking! 🚢${NC}"