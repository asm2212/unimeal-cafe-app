#!/bin/bash

# Simple Build Script for UniMeal Cafe App
# This script builds the APK locally without using EAS

set -e

echo "🚀 UniMeal Cafe App - Simple Build Script"
echo "========================================"
echo ""

# Get version from package.json
VERSION=$(node -p "require('./package.json').version")
echo "📋 Building version: $VERSION"
echo ""

# Ensure Android directory exists
if [ ! -d "android" ]; then
  echo "🔧 Preparing Android project..."
  npx expo prebuild --platform android
else
  echo "✅ Android project already exists"
fi

# Clean Android build
echo "🧹 Cleaning Android build..."
cd android
./gradlew clean
cd ..
echo "✅ Android build cleaned"
echo ""

# Create build directory
echo "📁 Creating build directory..."
mkdir -p build-output
echo "✅ Build directory created"
echo ""

# Build the APK
echo "🔨 Building APK..."
cd android
./gradlew assembleRelease
cd ..
echo "✅ APK built successfully"
echo ""

# Copy APK to root directory
echo "📦 Copying APK to project root..."
cp android/app/build/outputs/apk/release/app-release.apk ./unimeal-cafe-v${VERSION}.apk
echo "✅ APK copied to project root: unimeal-cafe-v${VERSION}.apk"
echo ""

# Copy APK to build-output directory
echo "📦 Copying APK to build-output directory..."
cp android/app/build/outputs/apk/release/app-release.apk ./build-output/unimeal-cafe-v${VERSION}.apk
echo "✅ APK copied to build-output directory"
echo ""

# Create APK info file
echo "📝 Creating build information..."
cat > build-output/APK_INFO.md << EOF
# UniMeal Cafe v${VERSION} - Android APK

## 📱 Installation Instructions

### Quick Install
1. **Download** the APK file from this release
2. **Enable Unknown Sources** in Android Settings:
   - Settings > Security > Unknown Sources (Android 7-8)
   - Settings > Apps > Special Access > Install Unknown Apps (Android 9+)
3. **Install** by tapping the downloaded APK file
4. **Launch** UniMeal Cafe from your app drawer

### System Requirements
- **Android Version**: 7.0+ (API Level 24+)
- **Storage Space**: ~50MB free
- **RAM**: 2GB+ recommended
- **Permissions**: Camera, Storage, Notifications

## ✨ What's New in v${VERSION}

### 🎨 Complete Responsive Design
- **Universal compatibility** across all screen sizes
- **Enhanced tablet experience** with optimized layouts
- **Smart scaling** that adapts to your device
- **Better touch targets** for improved accessibility

## 🐛 Troubleshooting

### APK Won't Install
- Ensure "Install from Unknown Sources" is enabled
- Check available storage space (need ~50MB)
- Try restarting your device
- Verify Android version is 7.0 or higher

## 📞 Support

- **Issues**: Report on [GitHub Issues](https://github.com/asm2212/unimeal-cafe-app/issues)
- **Source Code**: [GitHub Repository](https://github.com/asm2212/unimeal-cafe-app)

---

**🎉 Thank you for using UniMeal Cafe!**
EOF
echo "✅ Build information created"
echo ""

# Create GitHub release instructions
echo "🌐 GitHub Release Instructions:"
echo "1. Run: gh release create v${VERSION} --title \"UniMeal Cafe App v${VERSION}\" --notes-file RELEASE_NOTES_v${VERSION}.md ./build-output/APK_INFO.md ./unimeal-cafe-v${VERSION}.apk"
echo ""
echo "📱 Direct download link will be:"
echo "https://github.com/asm2212/unimeal-cafe-app/releases/download/v${VERSION}/unimeal-cafe-v${VERSION}.apk"
echo ""

echo "🎉 Build process completed successfully!"
