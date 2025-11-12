#!/bin/bash

# UniMeal Cafe App - APK Build Script
# Version: 2.8.0
# This script builds the production APK for the UniMeal Cafe app

echo "🚀 Building UniMeal Cafe App v2.8.0 APK..."
echo "=============================================="

# Check if EAS CLI is installed
if ! command -v eas &> /dev/null; then
    echo "❌ EAS CLI not found. Installing..."
    npm install -g @expo/eas-cli
fi

# Check if user is logged in
echo "🔐 Checking EAS authentication..."
eas whoami

# Build production APK using EAS
echo "📱 Building production APK..."
echo "This will create an optimized APK for distribution"

# Option 1: EAS Build (recommended for production)
echo "Building with EAS (cloud build)..."
eas build --platform android --profile production

# Alternative: Local build (requires Android SDK)
# echo "Building locally (requires Android SDK setup)..."
# npx expo run:android --variant release

echo "✅ Build process initiated!"
echo ""
echo "📋 Build Information:"
echo "   - App Name: UniMeal Cafe"
echo "   - Version: 2.8.0"
echo "   - Platform: Android"
echo "   - Build Type: Production APK"
echo "   - Features: Comprehensive responsive design"
echo ""
echo "🔗 Monitor build progress:"
echo "   - Visit: https://expo.dev/accounts/[your-account]/projects/unimeal-cafe-app/builds"
echo "   - Or run: eas build:list"
echo ""
echo "📥 Once complete, download the APK from the build URL"
