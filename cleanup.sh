#!/bin/bash

# UniMeal Cafe App Cleanup Script
# This script removes build artifacts and temporary files to reduce project size

echo "🧹 Cleaning up UniMeal Cafe App..."

# Remove Android build artifacts
echo "Removing Android build artifacts..."
rm -rf android/app/.cxx
rm -rf android/build
rm -rf android/app/build

# Remove node_modules build artifacts
echo "Removing node_modules build artifacts..."
find node_modules -name "build" -type d -exec rm -rf {} + 2>/dev/null || true
find node_modules -name ".cxx" -type d -exec rm -rf {} + 2>/dev/null || true
find node_modules -name "*.so" -type f -delete 2>/dev/null || true
find node_modules -name "*.dll" -type f -delete 2>/dev/null || true

# Remove logs and cache files
echo "Removing logs and cache files..."
find . -name "*.log" -type f -delete 2>/dev/null || true
find . -name "CMakeCache.txt" -type f -delete 2>/dev/null || true

# Remove temporary files
echo "Removing temporary files..."
rm -rf tmp/
rm -rf temp/
rm -rf .expo/

echo "✅ Cleanup complete!"
echo "📊 Current project size:"
du -sh .
