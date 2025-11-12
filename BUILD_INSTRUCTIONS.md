# UniMeal Cafe App - Build Instructions

## Version 2.8.0 - Responsive Design Update

### 🎉 What's New in v2.8.0
- **Comprehensive responsive design** across all screens
- **Enhanced user experience** for phones, tablets, and all orientations
- **New responsive utility system** for consistent sizing and spacing
- **Improved accessibility** with proper touch targets
- **Optimized layouts** for different device types

### 📱 Building the APK

#### Prerequisites
1. **EAS CLI** installed globally: `npm install -g @expo/eas-cli`
2. **Expo account** with access to the project
3. **Android SDK** (for local builds only)

#### Option 1: EAS Build (Recommended)
```bash
# Run the build script
./scripts/build-apk.sh

# Or manually:
eas build --platform android --profile production
```

#### Option 2: Local Build
```bash
# Requires Android SDK setup
npx expo run:android --variant release
```

### 🔧 Build Profiles

#### Production Profile
- **Output**: APK file
- **Optimization**: Full production optimizations
- **Environment**: Production API endpoints
- **Auto-increment**: Version codes automatically incremented

#### Preview Profile
- **Output**: APK file for testing
- **Distribution**: Internal testing
- **Environment**: Development/staging endpoints

### 📋 Build Configuration

The app is configured with:
- **Package**: `com.unimeal.cafe`
- **Min SDK**: Android 24 (Android 7.0)
- **Target SDK**: Android 35
- **Permissions**: Camera, Storage, Notifications, Media access

### 🚀 Deployment Steps

1. **Update Version** (already done for v2.8.0)
   ```bash
   # Version updated in:
   # - app.json
   # - package.json
   ```

2. **Build APK**
   ```bash
   ./scripts/build-apk.sh
   ```

3. **Download APK**
   - Monitor build at: https://expo.dev/builds
   - Download APK when build completes

4. **Test APK**
   - Install on test devices
   - Verify responsive design works correctly
   - Test all screen sizes and orientations

5. **Distribute**
   - Upload to Google Play Console
   - Or distribute directly to users

### 🔍 Monitoring Builds

```bash
# Check build status
eas build:list

# View specific build
eas build:view [BUILD_ID]

# Cancel running build
eas build:cancel [BUILD_ID]
```

### 🐛 Troubleshooting

#### Authentication Issues
```bash
# Check current user
eas whoami

# Login with correct account
eas login

# Logout if needed
eas logout
```

#### Build Failures
1. Check build logs in Expo dashboard
2. Verify all dependencies are compatible
3. Ensure proper permissions in app.json
4. Check for any TypeScript errors

#### Local Build Issues
1. Ensure Android SDK is properly installed
2. Set ANDROID_HOME environment variable
3. Install required build tools
4. Check device/emulator connection

### 📊 Version History

- **v2.8.0**: Comprehensive responsive design implementation
- **v2.7.0**: Previous stable version
- **v2.6.x**: Earlier versions

### 🔗 Useful Links

- [Expo EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [Android Build Configuration](https://docs.expo.dev/build-reference/android-builds/)
- [Project Repository](https://github.com/asm2212/unimeal-cafe-app)

---

**Note**: This version includes significant responsive design improvements that enhance the user experience across all device types. Make sure to test thoroughly on different screen sizes before production deployment.
