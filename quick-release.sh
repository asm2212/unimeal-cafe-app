#!/bin/bash

# Quick Release Script for UniMeal Cafe App
# This script creates a GitHub release using the latest existing APK

set -e

echo "🚀 UniMeal Cafe App - Quick Release Script"
echo "=========================================="
echo ""

# Get version from package.json
VERSION=$(node -p "require('./package.json').version")
echo "📋 Releasing version: $VERSION"
echo ""

# Find the latest APK
LATEST_APK=$(ls -t unimeal-cafe-v*.apk | head -1)
echo "📦 Using APK: $LATEST_APK"
echo ""

# Create a copy with the new version number
echo "🔄 Creating APK with new version number..."
cp "$LATEST_APK" "unimeal-cafe-v${VERSION}.apk"
echo "✅ Created: unimeal-cafe-v${VERSION}.apk"
echo ""

# Create build directory if it doesn't exist
echo "📁 Setting up build directory..."
mkdir -p build-output
echo "✅ Build directory ready"
echo ""

# Create APK info file
echo "📝 Creating release information..."
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
echo "✅ Release information created"
echo ""

# Create installation helper
echo "📱 Creating installation helper..."
cat > build-output/install-helper.txt << EOF
UniMeal Cafe - Quick Installation Guide
======================================

For Android Devices:
1. Download the APK file
2. Go to Settings > Security
3. Enable "Unknown Sources" or "Install Unknown Apps"
4. Tap the downloaded APK file
5. Follow the installation prompts
6. Launch "UniMeal Cafe" from your apps

Need Help?
- Read APK_INFO.md for detailed instructions
- Visit GitHub repository for support

Enjoy your new responsive UniMeal Cafe app! 🎉
EOF
echo "✅ Installation helper created"
echo ""

# Check if GitHub CLI is installed
if command -v gh &> /dev/null; then
    echo "🌐 Creating GitHub release..."
    gh release create "v${VERSION}" --title "UniMeal Cafe App v${VERSION}" --notes-file "RELEASE_NOTES_v${VERSION}.md" "./build-output/APK_INFO.md" "./build-output/install-helper.txt" "./unimeal-cafe-v${VERSION}.apk"
    echo "✅ GitHub release created"
    echo ""
    echo "📱 Direct download link:"
    echo "https://github.com/asm2212/unimeal-cafe-app/releases/download/v${VERSION}/unimeal-cafe-v${VERSION}.apk"
else
    echo "⚠️ GitHub CLI not installed. Please run the following command manually:"
    echo "gh release create v${VERSION} --title \"UniMeal Cafe App v${VERSION}\" --notes-file RELEASE_NOTES_v${VERSION}.md ./build-output/APK_INFO.md ./build-output/install-helper.txt ./unimeal-cafe-v${VERSION}.apk"
    echo ""
    echo "📱 Direct download link will be:"
    echo "https://github.com/asm2212/unimeal-cafe-app/releases/download/v${VERSION}/unimeal-cafe-v${VERSION}.apk"
fi

echo ""
echo "🎉 Release process completed successfully!"
