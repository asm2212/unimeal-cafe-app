# UniMeal Cafe App v2.6.0 Release Notes

## 🎉 What's New in v2.6.0

### 🔔 Enhanced Notification System
- **Foreground Notifications**: Receive real-time alerts even when the app is open
- **Background Notifications**: Full notification support when the app is closed or in background
- **App State Monitoring**: Get notified when the app becomes active or goes to background
- **Notification Status Alerts**: Clear feedback when notifications are enabled/disabled

### 📱 Improved Student Details Screen
- **Scrollable Modal**: Balance update modal now scrolls to prevent keyboard hiding content
- **Keyboard Awareness**: Enhanced keyboard handling with `KeyboardAvoidingView`
- **Quick Actions**: Add Balance and Deduct Balance buttons with improved UX

### 🔧 Technical Improvements
- **Badge Management**: Proper notification badge counting and clearing
- **Cross-Platform Support**: Optimized notifications for both iOS and Android
- **Error Handling**: Robust error handling for all notification operations
- **App State Listeners**: Monitor app transitions between active/inactive/background states

## 📋 Features

### Notification Types
- 💰 **Transaction Notifications** (foreground & background)
- 📱 **App State Changes** (active/inactive alerts)
- 🔔 **Notification Status** (enabled/disabled alerts)
- 📊 **Batch Transactions** (multiple transactions summary)

### Student Management
- ✅ **Add Balance** with payment method selection
- ❌ **Deduct Balance** with reason tracking
- 📊 **Balance History** and status monitoring
- 🔍 **Student Search** and filtering

### Dashboard Features
- 📈 **Real-time Statistics**
- 🔄 **Auto-refresh** every 30 seconds
- 📊 **Transaction Monitoring**
- 🔔 **Notification Management**

## 🛠️ Building the APK

### Prerequisites
- Node.js 18+ installed
- Expo CLI installed globally: `npm install -g @expo/cli`
- EAS CLI installed globally: `npm install -g eas-cli`

### Build Instructions

1. **Clone the repository:**
   ```bash
   git clone https://github.com/asm2212/unimeal-cafe-app.git
   cd unimeal-cafe-app
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Build APK using EAS Build:**
   ```bash
   # Login to Expo (if not already logged in)
   eas login
   
   # Build production APK
   eas build --platform android --profile production
   ```

4. **Alternative: Local Build (requires Android Studio):**
   ```bash
   # Generate native Android project
   npx expo prebuild --platform android
   
   # Build APK locally
   cd android
   ./gradlew assembleRelease
   ```

### Build Profiles
- **Development**: `eas build --platform android --profile development`
- **Preview**: `eas build --platform android --profile preview`
- **Production**: `eas build --platform android --profile production`

## 🔧 Configuration

### Environment Variables
- `EXPO_PUBLIC_API_URL`: Backend API URL (configured in eas.json)

### Permissions
- Camera access for QR code scanning
- Notification permissions for real-time alerts
- Storage permissions for QR code saving
- Vibration for notification feedback

## 🐛 Bug Fixes
- Fixed keyboard hiding modal content in student details
- Improved notification reliability across app states
- Enhanced error handling for API requests
- Fixed badge count synchronization issues

## 📱 Compatibility
- **Android**: API level 24+ (Android 7.0+)
- **iOS**: iOS 13.0+
- **Expo SDK**: 54.0.22
- **React Native**: 0.81.5

## 🔗 Links
- **Repository**: https://github.com/asm2212/unimeal-cafe-app
- **Issues**: https://github.com/asm2212/unimeal-cafe-app/issues
- **Backend API**: https://unimeal-backend.duckdns.org

## 📥 Download

### Ready-to-Install APK
- **[Download UniMeal Cafe v2.6.0 APK](https://github.com/asm2212/unimeal-cafe-app/releases/download/v2.6.0/unimeal-cafe-v2.6.0.apk)** (91+ MB)

### Installation Instructions
1. Download the APK file from the link above
2. Enable "Install from Unknown Sources" in your Android settings
3. Open the downloaded APK file and follow the installation prompts
4. Grant necessary permissions when prompted

---

**Note**: The APK is built and ready for installation. You can also build your own APK using the instructions above if preferred.
