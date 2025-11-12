#!/bin/bash

# UniMeal Cafe - Update GitHub Release with APK
# This script downloads the built APK and updates the GitHub release

set -e

echo "🚀 UniMeal Cafe - Release Update Script"
echo "======================================="

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Get the latest build info
echo -e "${BLUE}📋 Checking latest build status...${NC}"
BUILD_OUTPUT=$(eas build:list --limit=1)
BUILD_ID="a5275341-0382-4f70-92df-d04c596bae5f"
BUILD_STATUS=$(echo "$BUILD_OUTPUT" | grep "Status" | awk '{print $2}')
ARTIFACT_URL=""

echo -e "${BLUE}Build ID: ${BUILD_ID}${NC}"
echo -e "${BLUE}Status: ${BUILD_STATUS}${NC}"

if [ "$BUILD_STATUS" != "finished" ]; then
    echo -e "${YELLOW}⏳ Build is still in progress. Status: ${BUILD_STATUS}${NC}"
    echo -e "${BLUE}💡 You can monitor the build at:${NC}"
    echo "   https://expo.dev/accounts/samri44/projects/unimeal-cafe-app/builds/${BUILD_ID}"
    echo ""
    echo -e "${YELLOW}🔄 Run this script again once the build completes${NC}"
    exit 0
fi

if [ -z "$ARTIFACT_URL" ] || [ "$ARTIFACT_URL" = "null" ]; then
    echo -e "${RED}❌ No APK download URL found. Build may have failed.${NC}"
    echo -e "${BLUE}🔍 Check build logs at:${NC}"
    echo "   https://expo.dev/accounts/samri44/projects/unimeal-cafe-app/builds/${BUILD_ID}"
    exit 1
fi

echo -e "${GREEN}✅ Build completed successfully!${NC}"
echo -e "${BLUE}📥 APK URL: ${ARTIFACT_URL}${NC}"

# Download the APK
echo -e "${YELLOW}📱 Downloading APK...${NC}"
mkdir -p build-output
cd build-output

# Download APK
curl -L -o "unimeal-cafe-v2.8.0.apk" "$ARTIFACT_URL"

if [ ! -f "unimeal-cafe-v2.8.0.apk" ]; then
    echo -e "${RED}❌ Failed to download APK${NC}"
    exit 1
fi

APK_SIZE=$(du -h "unimeal-cafe-v2.8.0.apk" | cut -f1)
echo -e "${GREEN}✅ APK downloaded successfully (${APK_SIZE})${NC}"

# Update the GitHub release
echo -e "${YELLOW}🚀 Updating GitHub release...${NC}"
cd ..

# Upload APK to the existing release
gh release upload v2.8.0 "build-output/unimeal-cafe-v2.8.0.apk" --clobber

# Update release notes with APK information
gh release edit v2.8.0 --notes "# 🎉 UniMeal Cafe v2.8.0 - Complete Responsive Design

## 📱 Free Download Available

### 🚀 Quick Download
**📥 [Download APK (${APK_SIZE})](https://github.com/asm2212/unimeal-cafe-app/releases/download/v2.8.0/unimeal-cafe-v2.8.0.apk)**

### 📋 Installation Steps
1. **Download** the APK file above
2. **Enable Unknown Sources** in Android Settings
3. **Install** by tapping the downloaded APK
4. **Launch** UniMeal Cafe and enjoy!

### ✨ What's New in v2.8.0
- **🎨 Complete responsive design** across all screens
- **📱 Enhanced user experience** for phones and tablets  
- **♿ Improved accessibility** with proper touch targets
- **🔄 Optimized layouts** for all device sizes and orientations
- **📊 Better visual hierarchy** and spacing
- **🎯 Smart grid systems** that adapt to screen size

### 🔧 Key Features
- 📱 Universal device compatibility (phones, tablets, all orientations)
- 🎯 Enhanced tablet experience with centered content
- ♿ Improved accessibility with proper touch targets
- 🔄 Responsive layouts that adapt to screen size
- 📊 Adaptive components and smart spacing
- 🎨 Better visual design and hierarchy

### 📋 System Requirements
- **Android**: 7.0+ (API Level 24+)
- **Storage**: ~50MB free space
- **RAM**: 2GB+ recommended
- **Permissions**: Camera, Storage, Notifications

### 🛠️ Technical Details
- **Version**: 2.8.0
- **Build**: ${BUILD_ID}
- **Package**: com.unimeal.cafe
- **Size**: ${APK_SIZE}
- **Min SDK**: Android 7.0 (API 24)
- **Target SDK**: Android 14 (API 35)

### 📞 Support & Help
- **Installation Issues**: Check the APK_INFO.md file in downloads
- **Bug Reports**: [GitHub Issues](https://github.com/asm2212/unimeal-cafe-app/issues)
- **Source Code**: [GitHub Repository](https://github.com/asm2212/unimeal-cafe-app)
- **Build Logs**: [EAS Build Dashboard](https://expo.dev/accounts/samri44/projects/unimeal-cafe-app/builds/${BUILD_ID})

### 🎉 What Makes This Special
This release represents a major milestone in the UniMeal Cafe app development:
- **Complete responsive redesign** ensuring perfect experience on any device
- **Enhanced user interface** with modern, adaptive components
- **Improved performance** with optimized layouts and efficient rendering
- **Better accessibility** following modern mobile app standards

---

**🎉 Thank you for using UniMeal Cafe!** This version brings the app to a new level of quality and usability across all Android devices."

echo -e "${GREEN}✅ GitHub release updated successfully!${NC}"
echo ""
echo -e "${BLUE}🔗 Release URL: https://github.com/asm2212/unimeal-cafe-app/releases/tag/v2.8.0${NC}"
echo -e "${BLUE}📱 Direct APK Download: https://github.com/asm2212/unimeal-cafe-app/releases/download/v2.8.0/unimeal-cafe-v2.8.0.apk${NC}"
echo ""
echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
echo -e "${YELLOW}📋 Users can now download the APK from the GitHub release page${NC}"
