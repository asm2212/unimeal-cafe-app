# 🚀 Push to GitHub - Step by Step

## ✅ Local Repository Ready!

Your local git repository is set up with:
- ✅ All files committed
- ✅ Tag v1.0.0 created
- ✅ Branch renamed to 'main'

---

## 📝 Step 1: Create New Repository on GitHub

1. **Go to GitHub:**
   - Open: https://github.com/new
   - Or: https://github.com/asm2212 → Click "+" → "New repository"

2. **Repository Settings:**
   - **Repository name:** `unimeal-cafe-app`
   - **Description:** `UniMeal Cafe App - Digital cafeteria management system for cafe owners`
   - **Visibility:** ✅ Public (so anyone can download)
   - **DO NOT** initialize with README, .gitignore, or license
   - Click **"Create repository"**

---

## 🔐 Step 2: Authenticate (Choose ONE method)

### Method A: Using Personal Access Token (Recommended)

1. **Create Token:**
   - Go to: https://github.com/settings/tokens
   - Click: **"Generate new token"** → **"Generate new token (classic)"**
   - **Note:** "UniMeal Cafe App Deployment"
   - **Expiration:** 90 days (or No expiration)
   - **Scopes:** Check ✅ **repo** (all repository permissions)
   - Click: **"Generate token"**
   - **COPY THE TOKEN** immediately (you won't see it again!)

2. **Add Remote with Token:**
   ```bash
   cd /home/oro/dev/unimeal/unimeal-cafe-app
   git remote add origin https://YOUR_TOKEN@github.com/asm2212/unimeal-cafe-app.git
   ```
   
   Replace `YOUR_TOKEN` with the token you just copied.

3. **Push to GitHub:**
   ```bash
   git push -u origin main
   git push origin v1.0.0
   ```

### Method B: Using SSH Key

1. **Check if you have SSH key:**
   ```bash
   ls ~/.ssh/id_*.pub
   ```

2. **If no key exists, generate one:**
   ```bash
   ssh-keygen -t ed25519 -C "your_email@example.com"
   # Press Enter for all prompts
   ```

3. **Copy your public key:**
   ```bash
   cat ~/.ssh/id_ed25519.pub
   # Copy the entire output
   ```

4. **Add to GitHub:**
   - Go to: https://github.com/settings/keys
   - Click: **"New SSH key"**
   - **Title:** "UniMeal Deployment"
   - **Key:** Paste your public key
   - Click: **"Add SSH key"**

5. **Add Remote with SSH:**
   ```bash
   cd /home/oro/dev/unimeal/unimeal-cafe-app
   git remote add origin git@github.com:asm2212/unimeal-cafe-app.git
   ```

6. **Push to GitHub:**
   ```bash
   git push -u origin main
   git push origin v1.0.0
   ```

---

## 📦 Step 3: Create GitHub Release

After successfully pushing:

1. **Go to your repository:**
   ```
   https://github.com/asm2212/unimeal-cafe-app
   ```

2. **Create Release:**
   - Click **"Releases"** (right sidebar)
   - Click **"Create a new release"**

3. **Release Details:**
   - **Choose a tag:** Select `v1.0.0`
   - **Release title:** `UniMeal Cafe App v1.0.0 - Initial Release`
   
4. **Release Description:**
   ```markdown
   # 📱 UniMeal Cafe App v1.0.0

   First production release of UniMeal Cafe App - a complete digital cafeteria management system for cafe owners.

   ## ✨ Features

   - 👥 **Student Management** - Register and manage students
   - 🔍 **QR Code System** - Generate and scan QR codes
   - 💰 **Transaction Processing** - Process meal transactions
   - 💳 **Balance Management** - Manage student balances
   - 📊 **Revenue Tracking** - Track daily revenue
   - 📜 **Transaction History** - View complete transaction history

   ## 📥 Download & Install

   **Download APK:** [app-release.apk](https://github.com/asm2212/unimeal-cafe-app/releases/download/v1.0.0/app-release.apk)

   **Size:** 86 MB

   ### Installation Steps:

   1. Download the APK file above
   2. Enable "Unknown Sources" in phone settings:
      - Settings → Security → Enable "Install from Unknown Sources"
   3. Open the downloaded APK file
   4. Tap "Install"
   5. Login with your cafe owner credentials

   📖 **Full Installation Guide:** [Click Here](https://github.com/asm2212/unimeal-cafe-app/blob/main/INSTALLATION_GUIDE_FOR_CAFE_OWNERS.md)

   ## 📋 Requirements

   - **Android:** 7.0 or higher (API 24+)
   - **Storage:** 200 MB free space
   - **Internet:** Required for app functionality

   ## 🔧 Technical Details

   - **Version:** 1.0.0
   - **APK Size:** 86 MB
   - **React Native:** 0.81.5
   - **Expo SDK:** 54
   - **Min SDK:** 24 (Android 7.0)
   - **Target SDK:** 35 (Android 14)
   - **Architecture:** New Architecture enabled

   ## 🆘 Support

   Need help? Check our guides:
   - [Installation Guide](https://github.com/asm2212/unimeal-cafe-app/blob/main/INSTALLATION_GUIDE_FOR_CAFE_OWNERS.md)
   - [Deployment Guide](https://github.com/asm2212/unimeal-cafe-app/blob/main/DEPLOYMENT_GUIDE.md)

   Or contact: support@unimeal.com

   ## 📝 What's New

   - Initial production release
   - Complete cafe management features
   - Production-ready APK
   - Comprehensive documentation

   ---

   **Download link:** https://github.com/asm2212/unimeal-cafe-app/releases/download/v1.0.0/app-release.apk
   ```

5. **Upload APK:**
   - Scroll to **"Attach binaries"**
   - Click or drag to upload
   - Select: `/home/oro/dev/unimeal/unimeal-cafe-app/android/app/build/outputs/apk/release/app-release.apk`
   - Wait for upload (86 MB may take 1-2 minutes)

6. **Publish:**
   - Check ✅ **"Set as the latest release"**
   - Click **"Publish release"**

---

## 🎉 Step 4: Get Download Link

After publishing, your download link will be:

```
https://github.com/asm2212/unimeal-cafe-app/releases/download/v1.0.0/app-release.apk
```

---

## 📱 Step 5: Share with Cafe Owners

Send this message:

```
📱 UniMeal Cafe App is Ready!

Download the app here:
https://github.com/asm2212/unimeal-cafe-app/releases/download/v1.0.0/app-release.apk

Installation Guide:
https://github.com/asm2212/unimeal-cafe-app/blob/main/INSTALLATION_GUIDE_FOR_CAFE_OWNERS.md

Quick Steps:
1. Download APK (86 MB)
2. Settings → Security → Enable "Unknown Sources"
3. Install the APK
4. Login with your credentials

Need help? Contact: [YOUR_SUPPORT_NUMBER]
```

---

## ✅ Quick Command Reference

```bash
# If you chose Method A (Token):
cd /home/oro/dev/unimeal/unimeal-cafe-app
git remote add origin https://YOUR_TOKEN@github.com/asm2212/unimeal-cafe-app.git
git push -u origin main
git push origin v1.0.0

# If you chose Method B (SSH):
cd /home/oro/dev/unimeal/unimeal-cafe-app
git remote add origin git@github.com:asm2212/unimeal-cafe-app.git
git push -u origin main
git push origin v1.0.0
```

---

## 🔄 For Future Updates

When releasing v1.0.1:

1. **Update version:**
   - Edit `app.json` → change version to "1.0.1"
   - Edit `android/app/build.gradle` → update versionCode and versionName

2. **Rebuild APK:**
   ```bash
   cd android && ./gradlew :app:assembleRelease
   ```

3. **Commit and tag:**
   ```bash
   git add .
   git commit -m "Release v1.0.1 - Bug fixes"
   git tag -a v1.0.1 -m "Version 1.0.1"
   git push origin main
   git push origin v1.0.1
   ```

4. **Create new release on GitHub** with new APK

---

## 🆘 Troubleshooting

### "Authentication failed"
- **Token:** Make sure you copied the entire token
- **SSH:** Verify key is added to GitHub

### "Remote already exists"
- Remove it: `git remote remove origin`
- Add again with correct URL

### "Permission denied"
- **Token:** Ensure it has `repo` scope
- **SSH:** Check key permissions: `chmod 600 ~/.ssh/id_ed25519`

### "Large file warning"
- APK is 86 MB, which is fine for releases
- GitHub allows up to 100 MB per file

---

## 📊 Current Status

- ✅ Local repository initialized
- ✅ All files committed
- ✅ Tag v1.0.0 created
- ✅ Branch renamed to 'main'
- ⏳ **Next:** Create GitHub repository
- ⏳ **Next:** Add remote and push
- ⏳ **Next:** Create release and upload APK

---

**You're ready to push! Follow the steps above.** 🚀
