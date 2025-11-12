#!/bin/bash

# UniMeal Cafe - Build and Release Script
# Version: 2.8.0

set -e

echo "🚀 UniMeal Cafe Build & Release Script v2.8.0"
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get version from package.json
VERSION=$(node -p "require('./package.json').version")
echo -e "${BLUE}📋 Building version: ${VERSION}${NC}"

# Create build directory
mkdir -p build-output
cd build-output

# Create APK info file
echo -e "${YELLOW}📝 Creating build information...${NC}"
cat > APK_INFO.md << EOF
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

### 📱 Screen Improvements
- **QR Code Screen**: Enhanced sizing and responsive layout
- **Dashboard**: Adaptive stats grid and action cards
- **Settings**: Responsive form inputs and buttons
- **Students**: Dynamic search and responsive cards
- **Transactions**: Adaptive layouts and improved filters
- **Login**: Optimized for all device sizes

### 🔧 Technical Enhancements
- **Responsive utility system** for consistent design
- **Performance optimizations** with efficient layouts
- **Accessibility improvements** with proper touch targets
- **Cross-device compatibility** testing

## 🐛 Troubleshooting

### APK Won't Install
- Ensure "Install from Unknown Sources" is enabled
- Check available storage space (need ~50MB)
- Try restarting your device
- Verify Android version is 7.0 or higher

### App Crashes or Won't Open
- Restart your device
- Clear app data if previously installed
- Ensure sufficient RAM (2GB+ recommended)
- Check for conflicting apps

### Features Not Working
- Grant all requested permissions
- Ensure stable internet connection
- Check camera permissions for QR scanning
- Verify storage permissions for data saving

## 📞 Support

- **Issues**: Report on [GitHub Issues](https://github.com/asm2212/unimeal-cafe-app/issues)
- **Source Code**: [GitHub Repository](https://github.com/asm2212/unimeal-cafe-app)
- **Documentation**: Check repository README

## 🔒 Security & Privacy

- **Open Source**: Full source code available on GitHub
- **No Tracking**: No user data collection or tracking
- **Local Storage**: Data stored locally on your device
- **Secure**: No unnecessary permissions requested

---

**🎉 Thank you for using UniMeal Cafe!**
This version brings significant improvements to the user experience across all devices.
EOF

# Create version info
echo -e "${YELLOW}📊 Creating version information...${NC}"
cat > BUILD_INFO.txt << EOF
UniMeal Cafe Build Information
============================

Version: ${VERSION}
Build Date: $(date)
Build Type: Production Release
Platform: Android
Package: com.unimeal.cafe

Technical Specifications:
- Min SDK Version: 24 (Android 7.0)
- Target SDK Version: 35 (Android 14)
- Compile SDK Version: 35
- Build Tools: 35.0.0
- Kotlin Version: 2.1.0

Features:
- Complete responsive design system
- Enhanced user experience across all devices
- Improved accessibility and touch targets
- Optimized layouts for phones and tablets
- Cross-device compatibility

Repository: https://github.com/asm2212/unimeal-cafe-app
Release Tag: v${VERSION}
EOF

# Create installation script for users
echo -e "${YELLOW}📱 Creating installation helper...${NC}"
cat > install-helper.txt << EOF
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
- Check BUILD_INFO.txt for technical details
- Visit GitHub repository for support

Enjoy your new responsive UniMeal Cafe app! 🎉
EOF

cd ..

echo -e "${GREEN}✅ Build information created successfully!${NC}"
echo -e "${BLUE}📁 Files created in build-output/:${NC}"
ls -la build-output/

echo ""
echo -e "${YELLOW}⚠️  Note: APK file needs to be built separately due to EAS permissions${NC}"
echo -e "${BLUE}💡 Next steps:${NC}"
echo "   1. Build APK using proper EAS account"
echo "   2. Add APK file to build-output/ directory"
echo "   3. Create GitHub release with all files"
echo ""
echo -e "${GREEN}🚀 Ready for GitHub release!${NC}"
