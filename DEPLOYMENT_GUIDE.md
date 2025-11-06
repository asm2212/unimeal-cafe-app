# UniMeal Cafe App - Free Deployment Guide

This guide explains how to deploy the UniMeal Cafe App for free and make it available for cafe owners to download and use.

## 📦 APK Location

Your built APK is located at:
```
android/app/build/outputs/apk/release/app-release.apk
```
Size: 86 MB

---

## 🚀 Deployment Options (All Free)

### Option 1: GitHub Releases (Recommended)

**Best for**: Direct distribution, version control, completely free

#### Steps:

1. **Create a GitHub Repository** (if not already done)
   ```bash
   cd /home/oro/dev/unimeal/unimeal-cafe-app
   git init
   git add .
   git commit -m "Initial commit - UniMeal Cafe App v1.0.0"
   git remote add origin https://github.com/YOUR_USERNAME/unimeal-cafe-app.git
   git push -u origin main
   ```

2. **Create a Release**
   - Go to your GitHub repository
   - Click "Releases" → "Create a new release"
   - Tag: `v1.0.0`
   - Title: `UniMeal Cafe App v1.0.0`
   - Description: Add release notes
   - Upload `app-release.apk` as an asset
   - Click "Publish release"

3. **Share the Download Link**
   - Direct APK link: `https://github.com/YOUR_USERNAME/unimeal-cafe-app/releases/download/v1.0.0/app-release.apk`
   - Share this link with cafe owners

**Advantages:**
- ✅ Completely free
- ✅ Version control
- ✅ Direct download link
- ✅ Update history
- ✅ No size limits

---

### Option 2: Google Drive

**Best for**: Quick sharing, no GitHub account needed

#### Steps:

1. **Upload APK to Google Drive**
   - Go to [drive.google.com](https://drive.google.com)
   - Upload `app-release.apk`
   - Right-click → "Get link"
   - Change to "Anyone with the link can view"
   - Copy the link

2. **Create a Shareable Link**
   - Share the link with cafe owners
   - They can download directly from Google Drive

**Advantages:**
- ✅ Very simple
- ✅ No technical knowledge required
- ✅ 15 GB free storage

---

### Option 3: Firebase App Distribution (Free Tier)

**Best for**: Beta testing, analytics, controlled distribution

#### Steps:

1. **Install Firebase CLI**
   ```bash
   npm install -g firebase-tools
   firebase login
   ```

2. **Initialize Firebase**
   ```bash
   cd /home/oro/dev/unimeal/unimeal-cafe-app
   firebase init
   # Select "App Distribution"
   ```

3. **Upload APK**
   ```bash
   firebase appdistribution:distribute android/app/build/outputs/apk/release/app-release.apk \
     --app YOUR_FIREBASE_APP_ID \
     --release-notes "UniMeal Cafe App v1.0.0" \
     --groups "cafe-owners"
   ```

4. **Invite Testers**
   - Go to Firebase Console → App Distribution
   - Add cafe owners' emails
   - They'll receive download links

**Advantages:**
- ✅ Free tier available
- ✅ Analytics and crash reporting
- ✅ Controlled distribution
- ✅ Email notifications

---

### Option 4: Expo EAS Build (Free Tier)

**Best for**: Automated builds, OTA updates

#### Steps:

1. **Install EAS CLI**
   ```bash
   npm install -g eas-cli
   eas login
   ```

2. **Configure EAS**
   ```bash
   cd /home/oro/dev/unimeal/unimeal-cafe-app
   eas build:configure
   ```

3. **Build and Submit**
   ```bash
   # Build APK
   eas build --platform android --profile production
   
   # After build completes, download APK from EAS dashboard
   ```

4. **Share Download Link**
   - EAS provides a download link
   - Share with cafe owners

**Advantages:**
- ✅ Free tier (limited builds/month)
- ✅ Automated builds
- ✅ OTA updates possible
- ✅ Build in the cloud

---

### Option 5: Self-Hosted (Your Own Server)

**Best for**: Full control, custom domain

#### Steps:

1. **Upload to Your Server**
   ```bash
   scp android/app/build/outputs/apk/release/app-release.apk user@your-server.com:/var/www/html/downloads/
   ```

2. **Create Download Page**
   Create a simple HTML page:
   ```html
   <!DOCTYPE html>
   <html>
   <head>
       <title>Download UniMeal Cafe App</title>
   </head>
   <body>
       <h1>UniMeal Cafe App</h1>
       <p>Version 1.0.0</p>
       <a href="/downloads/app-release.apk" download>
           <button>Download APK (86 MB)</button>
       </a>
   </body>
   </html>
   ```

3. **Share URL**
   - `https://your-domain.com/downloads/app-release.apk`

**Advantages:**
- ✅ Full control
- ✅ Custom branding
- ✅ No third-party dependencies

---

## 📱 Installation Instructions for Cafe Owners

### For Android Devices:

1. **Enable Unknown Sources**
   - Go to Settings → Security
   - Enable "Install from Unknown Sources" or "Allow from this source"

2. **Download APK**
   - Click the download link you provided
   - APK will download to device

3. **Install APK**
   - Open downloaded file
   - Tap "Install"
   - Wait for installation to complete
   - Tap "Open"

4. **First Launch**
   - App will request permissions (camera, storage)
   - Grant necessary permissions
   - Login with cafe owner credentials

### Important Notes:
- ⚠️ APK is not signed with Google Play signing
- ⚠️ Users will see "Unknown source" warning (normal for APKs outside Play Store)
- ⚠️ Ensure users download from your official link only

---

## 🔄 Updating the App

### For New Versions:

1. **Update version in app.json**
   ```json
   {
     "expo": {
       "version": "1.0.1"
     }
   }
   ```

2. **Update version in android/app/build.gradle**
   ```gradle
   versionCode 2
   versionName "1.0.1"
   ```

3. **Rebuild APK**
   ```bash
   cd android && ./gradlew :app:assembleRelease
   ```

4. **Upload new version** using your chosen deployment method

5. **Notify cafe owners** to download and install the update

---

## 🎯 Recommended Approach for Free Distribution

**Best Free Solution:**

1. **GitHub Releases** for APK hosting
2. **Create a simple landing page** with download instructions
3. **Use WhatsApp/Telegram** to share download link with cafe owners
4. **Provide installation video tutorial**

### Example Distribution Flow:

```
1. Build APK ✅
2. Upload to GitHub Releases ✅
3. Create download page with instructions
4. Share link via WhatsApp/Telegram groups
5. Provide support via messaging apps
```

---

## 🔐 Security Considerations

### For Production Use:

1. **Sign the APK** with your own keystore (for updates):
   ```bash
   keytool -genkey -v -keystore unimeal-cafe.keystore \
     -alias unimeal-cafe -keyalg RSA -keysize 2048 -validity 10000
   ```

2. **Update android/app/build.gradle**:
   ```gradle
   signingConfigs {
       release {
           storeFile file('unimeal-cafe.keystore')
           storePassword 'YOUR_PASSWORD'
           keyAlias 'unimeal-cafe'
           keyPassword 'YOUR_PASSWORD'
       }
   }
   ```

3. **Rebuild with signing**:
   ```bash
   cd android && ./gradlew :app:assembleRelease
   ```

---

## 📊 Analytics & Monitoring (Optional)

### Free Tools:

1. **Firebase Analytics** (Free)
   - Track app usage
   - Monitor crashes
   - User behavior

2. **Sentry** (Free tier)
   - Error tracking
   - Performance monitoring

3. **Google Analytics** (Free)
   - User analytics
   - Event tracking

---

## 💡 Pro Tips

1. **Create a QR Code** for easy download
   - Use [qr-code-generator.com](https://www.qr-code-generator.com/)
   - Link to your APK download page
   - Print and share with cafe owners

2. **Create Installation Video**
   - Record screen showing installation steps
   - Upload to YouTube
   - Share link with cafe owners

3. **Set up Support Channel**
   - WhatsApp group for cafe owners
   - Telegram channel for updates
   - Email support

4. **Version Naming**
   - Use semantic versioning (1.0.0, 1.0.1, etc.)
   - Keep changelog in GitHub releases

---

## 🆘 Troubleshooting

### Common Issues:

1. **"App not installed" error**
   - Solution: Uninstall old version first
   - Enable "Install from Unknown Sources"

2. **"Parse error"**
   - Solution: Re-download APK (may be corrupted)
   - Check Android version compatibility (minimum Android 7.0)

3. **App crashes on launch**
   - Solution: Clear app data and cache
   - Reinstall the app

---

## 📞 Support

For cafe owners who need help:
- Email: support@unimeal.com
- WhatsApp: +251-XXX-XXXX
- Documentation: https://your-docs-site.com

---

## ✅ Checklist Before Distribution

- [ ] APK built successfully
- [ ] Tested on real Android device
- [ ] All features working correctly
- [ ] Backend API is accessible
- [ ] Created download page/link
- [ ] Prepared installation instructions
- [ ] Set up support channel
- [ ] Tested installation process
- [ ] Created update mechanism
- [ ] Documented known issues

---

## 🎉 You're Ready!

Your UniMeal Cafe App is now ready for free distribution. Choose your preferred deployment method and start sharing with cafe owners!

**Current APK**: `android/app/build/outputs/apk/release/app-release.apk` (86 MB)
**Version**: 1.0.0
**Build Date**: November 6, 2025
