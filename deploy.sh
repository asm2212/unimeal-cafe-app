#!/bin/bash

# UniMeal Cafe App - Deployment Script
# This script helps you deploy the app to various platforms

echo "🚀 UniMeal Cafe App Deployment Helper"
echo "======================================"
echo ""

# Function to get app version from app.json
get_app_version() {
    node -p "require('./app.json').expo.version"
}

# Get version
VERSION=$(get_app_version)
echo "App Version: v$VERSION"
echo ""

# Function to create GitHub release
create_github_release() {
    echo "📦 Creating GitHub Release..."
    
    # Check if tag already exists
    if gh release view "v$VERSION" >/dev/null 2>&1; then
        echo "⚠️  Release v$VERSION already exists"
        read -p "Do you want to overwrite it? (y/N): " overwrite
        if [[ ! $overwrite =~ ^[Yy]$ ]]; then
            echo "❌ Release cancelled"
            return 1
        fi
        echo "Deleting existing release..."
        gh release delete "v$VERSION" --yes
        git tag -d "v$VERSION" 2>/dev/null || true
        git push origin ":refs/tags/v$VERSION" 2>/dev/null || true
    fi
    
    # Create git tag
    echo "Creating git tag v$VERSION..."
    git tag -a "v$VERSION" -m "UniMeal Cafe App v$VERSION"
    git push origin "v$VERSION"
    
    # Find APK file
    APK_FILE=""
    if [ -f "build-output/app-release.apk" ]; then
        APK_FILE="build-output/app-release.apk"
    elif [ -f "android/app/build/outputs/apk/release/app-release.apk" ]; then
        APK_FILE="android/app/build/outputs/apk/release/app-release.apk"
    else
        # Look for any APK in the project
        APK_FILE=$(find . -name "*.apk" -type f | head -1)
    fi
    
    if [ -z "$APK_FILE" ] || [ ! -f "$APK_FILE" ]; then
        echo "❌ APK file not found"
        echo "Please build the APK first using one of these methods:"
        echo "  1. EAS Build: npx eas build -p android --profile production"
        echo "  2. Local build: cd android && ./gradlew assembleRelease"
        return 1
    fi
    
    # Get release notes file
    RELEASE_NOTES_FILE=""
    if [ -f "RELEASE_NOTES_v${VERSION}.md" ]; then
        RELEASE_NOTES_FILE="RELEASE_NOTES_v${VERSION}.md"
    elif [ -f "RELEASE_NOTES.md" ]; then
        RELEASE_NOTES_FILE="RELEASE_NOTES.md"
    fi
    
    # Create release
    echo "Creating GitHub release..."
    if [ -n "$RELEASE_NOTES_FILE" ]; then
        gh release create "v$VERSION" \
            "$APK_FILE"#UniMeal-Cafe-v${VERSION}.apk \
            --title "UniMeal Cafe v${VERSION}" \
            --notes-file "$RELEASE_NOTES_FILE"
    else
        gh release create "v$VERSION" \
            "$APK_FILE"#UniMeal-Cafe-v${VERSION}.apk \
            --title "UniMeal Cafe v${VERSION}" \
            --notes "UniMeal Cafe App v${VERSION} Release"
    fi
    
    echo "✅ GitHub Release created successfully!"
    echo "Download URL: https://github.com/$(gh repo view --json nameWithOwner -q .nameWithOwner)/releases/download/v$VERSION/UniMeal-Cafe-v${VERSION}.apk"
}

# Show deployment options
echo "Choose deployment method:"
echo ""
echo "1. GitHub Releases (Recommended)"
echo "2. Copy to Downloads folder"
echo "3. Upload to Google Drive (manual)"
echo "4. Firebase App Distribution"
echo "5. Show APK info only"
echo ""

read -p "Enter your choice (1-5): " choice

case $choice in
    1)
        echo ""
        echo "📦 GitHub Releases Deployment"
        echo "=============================="
        echo ""
        create_github_release
        ;;
    
    2)
        echo ""
        echo "📁 Copying APK to Downloads folder..."
        
        # Find APK file
        APK_FILE=""
        if [ -f "build-output/app-release.apk" ]; then
            APK_FILE="build-output/app-release.apk"
        elif [ -f "android/app/build/outputs/apk/release/app-release.apk" ]; then
            APK_FILE="android/app/build/outputs/apk/release/app-release.apk"
        else
            # Look for any APK in the project
            APK_FILE=$(find . -name "*.apk" -type f | head -1)
        fi
        
        if [ -z "$APK_FILE" ] || [ ! -f "$APK_FILE" ]; then
            echo "❌ APK file not found"
            echo "Please build the APK first."
            exit 1
        fi
        
        DEST="$HOME/Downloads/unimeal-cafe-app-v$VERSION.apk"
        cp "$APK_FILE" "$DEST"
        echo "✅ APK copied to: $DEST"
        echo ""
        echo "You can now:"
        echo "- Upload to Google Drive"
        echo "- Send via email/WhatsApp"
        echo "- Upload to your server"
        ;;
    
    3)
        echo ""
        echo "☁️  Google Drive Upload"
        echo "======================"
        echo ""
        echo "1. Go to https://drive.google.com"
        echo "2. Click 'New' → 'File upload'"
        echo "3. Select the APK file"
        echo "4. After upload, right-click → 'Get link'"
        echo "5. Change to 'Anyone with the link can view'"
        echo "6. Copy and share the link"
        echo ""
        
        # Copy to Downloads for easy access
        DEST="$HOME/Downloads/unimeal-cafe-app-v$VERSION.apk"
        cp "$APK_FILE" "$DEST" 2>/dev/null || echo "Note: APK not found, please build it first"
        echo "✅ APK copied to Downloads folder for easy upload (if available)"
        ;;
    
    4)
        echo ""
        echo "🔥 Firebase App Distribution"
        echo "============================"
        echo ""
        
        # Check if Firebase CLI is installed
        if ! command -v firebase &> /dev/null; then
            echo "❌ Firebase CLI not found"
            echo ""
            echo "Install it with:"
            echo "  npm install -g firebase-tools"
            echo ""
            exit 1
        fi
        
        echo "Firebase CLI found ✅"
        echo ""
        read -p "Enter your Firebase App ID: " APP_ID
        
        if [ -z "$APP_ID" ]; then
            echo "❌ App ID required"
            exit 1
        fi
        
        # Find APK file
        APK_FILE=""
        if [ -f "build-output/app-release.apk" ]; then
            APK_FILE="build-output/app-release.apk"
        elif [ -f "android/app/build/outputs/apk/release/app-release.apk" ]; then
            APK_FILE="android/app/build/outputs/apk/release/app-release.apk"
        else
            # Look for any APK in the project
            APK_FILE=$(find . -name "*.apk" -type f | head -1)
        fi
        
        if [ -z "$APK_FILE" ] || [ ! -f "$APK_FILE" ]; then
            echo "❌ APK file not found"
            echo "Please build the APK first."
            exit 1
        fi
        
        echo ""
        echo "Uploading to Firebase App Distribution..."
        firebase appdistribution:distribute "$APK_FILE" \
            --app "$APP_ID" \
            --release-notes "UniMeal Cafe App v$VERSION - Latest Release" \
            --groups "cafe-owners"
        
        echo ""
        echo "✅ Uploaded! Check Firebase Console for download link"
        ;;
    
    5)
        echo ""
        echo "📊 APK Information"
        echo "=================="
        echo ""
        
        # Find APK file
        APK_FILE=""
        if [ -f "build-output/app-release.apk" ]; then
            APK_FILE="build-output/app-release.apk"
        elif [ -f "android/app/build/outputs/apk/release/app-release.apk" ]; then
            APK_FILE="android/app/build/outputs/apk/release/app-release.apk"
        else
            # Look for any APK in the project
            APK_FILE=$(find . -name "*.apk" -type f | head -1)
        fi
        
        if [ -z "$APK_FILE" ] || [ ! -f "$APK_FILE" ]; then
            echo "❌ APK file not found"
            echo "Please build the APK first."
            exit 1
        fi
        
        # Get APK size
        APK_SIZE=$(du -h "$APK_FILE" | cut -f1)
        echo "Location: $APK_FILE"
        echo "Size: $APK_SIZE"
        echo ""
        
        # Get APK details using aapt if available
        if command -v aapt &> /dev/null; then
            echo "Package details:"
            aapt dump badging "$APK_FILE" | grep -E "package:|versionCode|versionName|sdkVersion|targetSdkVersion"
        fi
        
        echo ""
        echo "MD5 checksum:"
        md5sum "$APK_FILE"
        echo ""
        ;;
    
    *)
        echo "❌ Invalid choice"
        exit 1
        ;;
esac

echo ""
echo "📚 For detailed deployment instructions, see:"
echo "   DEPLOYMENT_GUIDE.md"
echo ""
echo "📱 For cafe owner installation instructions, see:"
echo "   INSTALLATION_GUIDE_FOR_CAFE_OWNERS.md"
echo ""
echo "✅ Done!