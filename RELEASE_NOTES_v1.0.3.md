# Release Notes - Version 1.0.3

**Release Date:** November 9, 2024

## 🐛 Bug Fixes

### QR Code Functionality
- **Fixed QR Code Download**: Resolved issues with saving QR codes to the device gallery
  - Improved base64 data extraction from QR code data URLs
  - Enhanced error handling for file system operations
  - Added proper album creation for organized QR code storage
  
- **Fixed QR Code Print**: Resolved printing functionality issues
  - Improved data URL format validation
  - Enhanced HTML structure for better print layout
  - Added proper page margins and styling
  - Improved QR code image rendering in print preview

### Technical Improvements
- Updated FileSystem import to use legacy API for better compatibility
- Enhanced error messages for better user feedback
- Improved permission handling for media library access

## 📋 Changes Summary
- Fixed download QR code functionality
- Fixed print QR code functionality
- Improved error handling and user feedback
- Updated app version to 1.0.3

## 🔧 Technical Details
- Updated `expo-file-system` import to use legacy API
- Enhanced `downloadQR()` function with better error handling
- Enhanced `printQR()` function with improved HTML template
- Added proper data URL format validation

## 📱 Compatibility
- Android: API 24+
- Expo SDK: 54.0.22
- React Native: 0.81.5

## 🚀 Installation
Download the APK file and install on your Android device. Make sure to allow installation from unknown sources if prompted.

---

For any issues or questions, please contact support.
