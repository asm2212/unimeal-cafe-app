#!/bin/bash

# Local Server Script for UniMeal Cafe App
# This script starts a local HTTP server to serve the APK

echo "🚀 UniMeal Cafe App - Local Server"
echo "=================================="
echo ""

# Get version from package.json
VERSION=$(node -p "require('./package.json').version")
echo "📋 Serving version: $VERSION"
echo ""

# Check if APK exists
APK_FILE="unimeal-cafe-v${VERSION}.apk"
if [ ! -f "$APK_FILE" ]; then
    echo "❌ APK file not found: $APK_FILE"
    exit 1
fi

echo "📦 Found APK: $APK_FILE ($(du -h "$APK_FILE" | cut -f1))"
echo ""

# Get local IP address
IP_ADDRESS=$(hostname -I | awk '{print $1}')

# Create a simple HTTP server
echo "🌐 Starting HTTP server on port 8000..."
echo ""
echo "📱 Direct download link (local network only):"
echo "http://$IP_ADDRESS:8000/$APK_FILE"
echo ""
echo "Press Ctrl+C when done to stop the server"
echo ""

# Start the server
python3 -m http.server 8000
