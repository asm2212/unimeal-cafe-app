# Build Instructions for UniMeal Cafe App v1.0.3

## Overview
This document provides instructions for building the UniMeal Cafe App v1.0.3 with the QR code fixes.

## Changes in v1.0.3
- ✅ Fixed QR code download functionality
- ✅ Fixed QR code print functionality
- ✅ Improved error handling
- ✅ Enhanced user feedback

## Building the APK

### Option 1: EAS Build (Cloud Build - Recommended)

EAS Build is Expo's cloud build service that doesn't require local Android SDK installation.

#### Prerequisites
- Expo account (free tier available)
- EAS CLI installed: `npm install -g eas-cli`

#### Steps

1. **Login to EAS**
   ```bash
   eas login
   ```

2. **Build for Android**
   ```bash
   eas build --platform android --profile production
   ```
   
   This will:
   - Build the app in the cloud
   - Generate a signed APK
   - Provide a download link when complete

3. **Download the APK**
   - After the build completes, you'll receive a download link
   - Download the APK file
   - Rename it to `unimeal-cafe-v1.0.3.apk`

#### Alternative: Local Build with EAS

If you want to build locally but use EAS configuration:

```bash
eas build --platform android --profile production --local
```

**Note:** This requires:
- Docker installed on your machine
- Android SDK (optional with Docker)

### Option 2: Local Gradle Build

If you have Android SDK installed locally:

#### Prerequisites
- Android SDK installed
- ANDROID_HOME environment variable set
- Java JDK 17 or higher

#### Steps

1. **Set Android SDK Path**
   
   Create `android/local.properties`:
   ```properties
   sdk.dir=/path/to/your/Android/sdk
   ```
   
   Or set environment variable:
   ```bash
   export ANDROID_HOME=/path/to/your/Android/sdk
   ```

2. **Build the APK**
   ```bash
   cd android
   ./gradlew :app:assembleRelease
   ```

3. **Find the APK**
   ```
   android/app/build/outputs/apk/release/app-release.apk
   ```

4. **Copy to root directory**
   ```bash
   cp android/app/build/outputs/apk/release/app-release.apk ../unimeal-cafe-v1.0.3.apk
   ```

### Option 3: Using Expo CLI

```bash
npx expo run:android --variant release
```

**Note:** Requires Android SDK and a connected device or emulator.

## After Building

### 1. Test the APK
- Install on a test device
- Verify QR code download works
- Verify QR code print works
- Test all other features

### 2. Create GitHub Release

1. Go to: https://github.com/asm2212/unimeal-cafe-app/releases

2. Click "Create a new release"

3. Fill in the details:
   - **Tag:** v1.0.3 (already created)
   - **Release title:** UniMeal Cafe App v1.0.3 - QR Code Fixes
   - **Description:** Copy from RELEASE_NOTES_v1.0.3.md

4. Upload the APK file

5. Publish the release

### 3. Update Download Links

The APK will be available at:
```
https://github.com/asm2212/unimeal-cafe-app/releases/download/v1.0.3/unimeal-cafe-v1.0.3.apk
```

Update any documentation or download pages with this link.

## Troubleshooting

### EAS Build Authentication Error
```
Error: Entity not authorized
```

**Solution:**
1. Run `eas whoami` to check logged-in user
2. Run `eas login` to login with the correct account
3. Ensure you have access to the project (projectId: 89b29c9c-7521-4fb9-b3d7-9c5773cf24ac)

### Android SDK Not Found
```
SDK location not found
```

**Solution:**
- Use EAS Build (cloud) instead of local build
- Or install Android SDK and set ANDROID_HOME

### Gradle Build Fails
```
BUILD FAILED
```

**Solution:**
1. Clean the build:
   ```bash
   cd android
   ./gradlew clean
   ```
2. Try again:
   ```bash
   ./gradlew :app:assembleRelease
   ```

## Quick Build Command (EAS)

For the fastest build without local setup:

```bash
# Login once
eas login

# Build
eas build --platform android --profile production

# Wait for completion and download the APK
```

## Support

For issues or questions:
- Check the release notes: RELEASE_NOTES_v1.0.3.md
- Review the deployment guide: DEPLOYMENT_GUIDE.md
- Contact the development team

---

**Last Updated:** November 9, 2024
**Version:** 1.0.3
