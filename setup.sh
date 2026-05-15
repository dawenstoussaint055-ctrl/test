#!/bin/bash
# setup.sh - Quick setup script for VPS/Panel deployment

echo "╔═══════════════════════════════╗"
echo "║     INCONNU XD V3 - SETUP     ║"
echo "╚═══════════════════════════════╝"

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Installing..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    echo "❌ Node.js 20+ required. Current: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Install ffmpeg if not present
if ! command -v ffmpeg &> /dev/null; then
    echo "📦 Installing ffmpeg..."
    apt-get install -y ffmpeg 2>/dev/null || yum install -y ffmpeg 2>/dev/null || echo "⚠️ Could not install ffmpeg automatically"
fi

# Install dependencies
echo "📦 Installing npm packages..."
npm install

# Create .env if not exists
if [ ! -f ".env" ]; then
    cp .env.example .env
    echo "📝 Created .env from .env.example"
    echo "⚠️  Please edit .env and add your SESSION_ID and other settings!"
    echo "    nano .env"
fi

# Create auth directory
mkdir -p auth

echo ""
echo "╔═══════════════════════════════╗"
echo "║         SETUP COMPLETE!        ║"
echo "╚═══════════════════════════════╝"
echo ""
echo "📋 Next steps:"
echo "   1. Edit your .env file: nano .env"
echo "   2. Add your SESSION_ID from: https://inconnu-tech-web-session-id.onrender.com"
echo "   3. Add your MONGODB_URI"
echo "   4. Run: npm start"
echo ""
echo "📺 Tutorial: https://youtu.be/n09eZbKexQY"

