#!/bin/bash

# GitHub Pages Deployment Script for UniMeal Cafe App
# This script creates a GitHub Pages site to host the APK publicly

echo "🚀 UniMeal Cafe App - GitHub Pages Deployment"
echo "============================================="
echo ""

# Get version from package.json
VERSION=$(node -p "require('./package.json').version")
echo "📋 Deploying version: $VERSION"
echo ""

# Check if APK exists
APK_FILE="unimeal-cafe-v${VERSION}.apk"
if [ ! -f "$APK_FILE" ]; then
    echo "❌ APK file not found: $APK_FILE"
    exit 1
fi

echo "📦 Found APK: $APK_FILE ($(du -h "$APK_FILE" | cut -f1))"
echo ""

# Create gh-pages branch if it doesn't exist
echo "🔧 Setting up GitHub Pages..."
git checkout -b gh-pages 2>/dev/null || git checkout gh-pages

# Create docs directory if it doesn't exist
mkdir -p docs/downloads

# Copy APK to docs/downloads directory
echo "📋 Copying APK to docs/downloads directory..."
cp "$APK_FILE" "docs/downloads/$APK_FILE"

# Create index.html
echo "📝 Creating download page..."
cat > docs/index.html << EOF
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>UniMeal Cafe App Downloads</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }
        .container {
            background-color: #f9f9f9;
            border-radius: 10px;
            padding: 30px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        h1 {
            color: #2c3e50;
            border-bottom: 2px solid #3498db;
            padding-bottom: 10px;
        }
        .download-btn {
            display: inline-block;
            background-color: #3498db;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
            margin-top: 20px;
            transition: background-color 0.3s;
        }
        .download-btn:hover {
            background-color: #2980b9;
        }
        .version {
            font-size: 1.2em;
            font-weight: bold;
            color: #2c3e50;
        }
        .instructions {
            background-color: #f1f1f1;
            padding: 15px;
            border-radius: 5px;
            margin-top: 30px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>UniMeal Cafe App</h1>
        <p>Welcome to the official download page for UniMeal Cafe App.</p>
        
        <div>
            <p class="version">Latest Version: ${VERSION}</p>
            <p>Released: $(date +"%B %d, %Y")</p>
            <a href="downloads/${APK_FILE}" class="download-btn">Download APK</a>
        </div>
        
        <div class="instructions">
            <h2>Installation Instructions</h2>
            <ol>
                <li>Download the APK file by clicking the button above</li>
                <li>On your Android device, go to Settings > Security</li>
                <li>Enable "Unknown Sources" or "Install Unknown Apps"</li>
                <li>Open the downloaded APK file to install</li>
                <li>Follow the on-screen instructions to complete installation</li>
                <li>Launch UniMeal Cafe from your app drawer</li>
            </ol>
        </div>
    </div>
</body>
</html>
EOF

# Commit changes
echo "📤 Committing changes..."
git add docs
git commit -m "Deploy UniMeal Cafe v${VERSION} to GitHub Pages"

# Push to GitHub
echo "🚀 Pushing to GitHub..."
git push origin gh-pages -f

echo ""
echo "✅ GitHub Pages deployment complete!"
echo ""
echo "📱 Direct download link (will be available in a few minutes):"
echo "https://asm2212.github.io/unimeal-cafe-app/downloads/${APK_FILE}"
echo ""
echo "📄 Download page:"
echo "https://asm2212.github.io/unimeal-cafe-app/"
echo ""
echo "Note: It may take a few minutes for GitHub Pages to update."
echo "You need to enable GitHub Pages in your repository settings:"
echo "1. Go to repository settings"
echo "2. Scroll down to 'GitHub Pages'"
echo "3. Select 'gh-pages' branch and '/docs' folder"
echo "4. Click 'Save'"
echo ""

# Return to original branch
git checkout main

echo "🎉 Deployment process completed!"
