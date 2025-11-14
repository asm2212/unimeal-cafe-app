#!/bin/bash

set -e

echo "🚀 Starting release build and deploy..."

# Get current version
CURRENT_VERSION=$(grep '"version"' package.json | head -1 | sed 's/.*"version": "\([^"]*\)".*/\1/')
echo "Current version: $CURRENT_VERSION"

# Increment version
echo "📦 Incrementing version..."
npm version patch
NEW_VERSION=$(grep '"version"' package.json | head -1 | sed 's/.*"version": "\([^"]*\)".*/\1/')
echo "New version: $NEW_VERSION"

# Commit and push
echo "📝 Committing version bump..."
git add package.json package-lock.json
git commit -m "v$NEW_VERSION release"
git push origin main

# Build APK
echo "🔨 Building APK locally..."
cd android
./gradlew clean assembleRelease
cd ..

# Create GitHub release with APK
echo "🚀 Deploying to GitHub..."
gh release create "v$NEW_VERSION" \
  android/app/build/outputs/apk/release/app-release.apk \
  --title "v$NEW_VERSION" \
  --notes "Release version $NEW_VERSION"

echo "✅ Deploy complete! Version $NEW_VERSION is now available on GitHub Releases."
