#!/bin/bash

# UniMeal Cafe App - Deployment Script
# This script helps you deploy the app to various platforms

echo "🚀 UniMeal Cafe App Deployment Helper"
echo "======================================"
echo ""

# Check if APK exists
APK_PATH="android/app/build/outputs/apk/release/app-release.apk"

if [ ! -f "$APK_PATH" ]; then
    echo "❌ APK not found at $APK_PATH"
    echo "Please build the APK first:"
    echo "  cd android && ./gradlew :app:assembleRelease"
    exit 1
fi

# Get APK size
APK_SIZE=$(du -h "$APK_PATH" | cut -f1)
echo "✅ APK found: $APK_PATH ($APK_SIZE)"
echo ""

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
        echo "Steps to deploy to GitHub Releases:"
        echo ""
        echo "1. Commit your changes:"
        echo "   git add ."
        echo "   git commit -m 'Release v1.0.0'"
        echo ""
        echo "2. Create a tag:"
        echo "   git tag -a v1.0.0 -m 'UniMeal Cafe App v1.0.0'"
        echo ""
        echo "3. Push to GitHub:"
        echo "   git push origin main --tags"
        echo ""
        echo "4. Go to GitHub repository → Releases → Create new release"
        echo "5. Upload this APK: $APK_PATH"
        echo ""
        echo "Download link will be:"
        echo "https://github.com/YOUR_USERNAME/unimeal-cafe-app/releases/download/v1.0.0/app-release.apk"
        echo ""
        ;;
    
    2)
        echo ""
        echo "📁 Copying APK to Downloads folder..."
        DEST="$HOME/Downloads/unimeal-cafe-app-v1.0.0.apk"
        cp "$APK_PATH" "$DEST"
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
        echo "3. Select: $APK_PATH"
        echo "4. After upload, right-click → 'Get link'"
        echo "5. Change to 'Anyone with the link can view'"
        echo "6. Copy and share the link"
        echo ""
        
        # Copy to Downloads for easy access
        DEST="$HOME/Downloads/unimeal-cafe-app-v1.0.0.apk"
        cp "$APK_PATH" "$DEST"
        echo "✅ APK copied to Downloads folder for easy upload"
        ;;
    
    4)
        echo ""
        echo "🔥 Firebase App Distribution"
        echo "============================"
        echo ""
        
        # Check if Firebase CLI is installed
        if ! command -v firebase &> /dev/null; then
            echo "❌ Firebase CLI not installed"
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
        
        echo ""
        echo "Uploading to Firebase App Distribution..."
        firebase appdistribution:distribute "$APK_PATH" \
            --app "$APP_ID" \
            --release-notes "UniMeal Cafe App v1.0.0 - Initial Release" \
            --groups "cafe-owners"
        
        echo ""
        echo "✅ Uploaded! Check Firebase Console for download link"
        ;;
    
    5)
        echo ""
        echo "📊 APK Information"
        echo "=================="
        echo ""
        echo "Location: $APK_PATH"
        echo "Size: $APK_SIZE"
        echo ""
        
        # Get APK details using aapt if available
        if command -v aapt &> /dev/null; then
            echo "Package details:"
            aapt dump badging "$APK_PATH" | grep -E "package:|versionCode|versionName|sdkVersion|targetSdkVersion"
        fi
        
        echo ""
        echo "MD5 checksum:"
        md5sum "$APK_PATH"
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
echo "✅ Done!"
