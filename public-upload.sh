#!/bin/bash

# Public Upload Script for UniMeal Cafe App
# This script uploads the APK to a public file hosting service

echo "🚀 UniMeal Cafe App - Public Upload Script"
echo "=========================================="
echo ""

# Get version from package.json
VERSION=$(node -p "require('./package.json').version")
echo "📋 Uploading version: $VERSION"
echo ""

# Check if APK exists
APK_FILE="unimeal-cafe-v${VERSION}.apk"
if [ ! -f "$APK_FILE" ]; then
    echo "❌ APK file not found: $APK_FILE"
    exit 1
fi

echo "📦 Found APK: $APK_FILE ($(du -h "$APK_FILE" | cut -f1))"
echo ""

echo "📤 Upload options:"
echo "1. Firebase Storage (requires Firebase CLI)"
echo "2. Google Drive (manual upload)"
echo "3. Dropbox (manual upload)"
echo "4. Create QR code for local sharing"
echo ""

read -p "Choose an upload method (1-4): " choice

case $choice in
    1)
        echo ""
        echo "🔥 Firebase Storage Upload"
        echo "=========================="
        
        # Check if Firebase CLI is installed
        if ! command -v firebase &> /dev/null; then
            echo "❌ Firebase CLI not installed"
            echo ""
            echo "Install it with:"
            echo "  npm install -g firebase-tools"
            echo ""
            exit 1
        fi
        
        # Login to Firebase
        echo "🔑 Logging in to Firebase..."
        firebase login
        
        # Initialize Firebase if needed
        if [ ! -f ".firebaserc" ]; then
            echo "🔧 Initializing Firebase..."
            firebase init hosting
        fi
        
        # Create public directory if it doesn't exist
        mkdir -p public
        
        # Copy APK to public directory
        echo "📋 Copying APK to public directory..."
        cp "$APK_FILE" "public/$APK_FILE"
        
        # Deploy to Firebase
        echo "🚀 Deploying to Firebase..."
        firebase deploy --only hosting
        
        echo ""
        echo "✅ APK uploaded to Firebase Hosting"
        echo ""
        echo "📱 Direct download link:"
        echo "https://YOUR-FIREBASE-APP.web.app/$APK_FILE"
        echo ""
        echo "Replace 'YOUR-FIREBASE-APP' with your actual Firebase app name"
        ;;
        
    2)
        echo ""
        echo "☁️ Google Drive Upload"
        echo "======================"
        echo ""
        echo "1. Go to https://drive.google.com"
        echo "2. Click 'New' → 'File upload'"
        echo "3. Select: $APK_FILE"
        echo "4. After upload, right-click → 'Get link'"
        echo "5. Change to 'Anyone with the link can view'"
        echo "6. Copy and share the link"
        echo ""
        
        # Copy to Downloads for easy access
        DEST="$HOME/Downloads/$APK_FILE"
        cp "$APK_FILE" "$DEST"
        echo "✅ APK copied to Downloads folder for easy upload: $DEST"
        ;;
        
    3)
        echo ""
        echo "📦 Dropbox Upload"
        echo "================="
        echo ""
        echo "1. Go to https://www.dropbox.com"
        echo "2. Click 'Upload' → 'Files'"
        echo "3. Select: $APK_FILE"
        echo "4. After upload, click 'Share'"
        echo "5. Copy and share the link"
        echo ""
        
        # Copy to Downloads for easy access
        DEST="$HOME/Downloads/$APK_FILE"
        cp "$APK_FILE" "$DEST"
        echo "✅ APK copied to Downloads folder for easy upload: $DEST"
        ;;
        
    4)
        echo ""
        echo "📱 QR Code for Local Sharing"
        echo "==========================="
        
        # Check if qrencode is installed
        if ! command -v qrencode &> /dev/null; then
            echo "❌ qrencode not installed"
            echo ""
            echo "Install it with:"
            echo "  sudo apt-get install qrencode"
            echo ""
            exit 1
        fi
        
        # Get local IP address
        IP_ADDRESS=$(hostname -I | awk '{print $1}')
        
        # Create a simple HTTP server
        echo "🌐 Starting HTTP server on port 8000..."
        python3 -m http.server 8000 &
        SERVER_PID=$!
        
        # Generate QR code
        echo "📱 Generating QR code..."
        qrencode -o qrcode.png "http://$IP_ADDRESS:8000/$APK_FILE"
        
        echo ""
        echo "✅ QR code generated: qrcode.png"
        echo ""
        echo "📱 Direct download link (local network only):"
        echo "http://$IP_ADDRESS:8000/$APK_FILE"
        echo ""
        echo "Press Ctrl+C when done to stop the server"
        
        # Wait for user to press Ctrl+C
        trap "kill $SERVER_PID; echo ''; echo '✅ Server stopped'; exit 0" INT
        wait
        ;;
        
    *)
        echo "❌ Invalid choice"
        exit 1
        ;;
esac

echo ""
echo "🎉 Upload process completed!"
