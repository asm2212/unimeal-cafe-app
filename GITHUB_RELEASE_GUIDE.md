# GitHub Release Guide for UniMeal Cafe App v1.0.3

## Quick Release Steps

Since we have the code changes committed and tagged, here's how to create a GitHub release:

### Option 1: Automated Build with GitHub Actions (Recommended)

The repository now has a GitHub Actions workflow that will automatically build and release the APK.

#### Setup (One-time)

1. **Push the workflow file:**
   ```bash
   git add .github/workflows/build-release.yml
   git commit -m "Add GitHub Actions build workflow"
   git push origin main
   ```

2. **Trigger the build:**
   - The workflow will automatically run when you push a tag (already done: v1.0.3)
   - Or manually trigger it from GitHub Actions tab

3. **Manual trigger:**
   - Go to: https://github.com/asm2212/unimeal-cafe-app/actions
   - Click "Build and Release APK"
   - Click "Run workflow"
   - Select branch: main
   - Click "Run workflow"

The workflow will:
- ✅ Build the APK automatically
- ✅ Create a GitHub release
- ✅ Upload the APK to the release
- ✅ Make it available for download

### Option 2: Manual Release (If you have APK ready)

If you already have a built APK file:

#### Steps:

1. **Go to GitHub Releases:**
   ```
   https://github.com/asm2212/unimeal-cafe-app/releases
   ```

2. **Click "Draft a new release"**

3. **Fill in the details:**
   - **Choose a tag:** v1.0.3 (existing)
   - **Release title:** UniMeal Cafe App v1.0.3 - QR Code Fixes
   - **Description:** Copy the content from `RELEASE_NOTES_v1.0.3.md`

4. **Upload the APK:**
   - Click "Attach binaries by dropping them here or selecting them"
   - Upload your APK file (rename it to: `unimeal-cafe-v1.0.3.apk`)

5. **Publish:**
   - Uncheck "Set as a pre-release" (unless it's a beta)
   - Click "Publish release"

### Option 3: Build Locally and Release

If you have Android SDK installed:

```bash
# Build the APK
cd android
./gradlew :app:assembleRelease

# Copy and rename
cp app/build/outputs/apk/release/app-release.apk ../unimeal-cafe-v1.0.3.apk

# Then follow Option 2 to create the release manually
```

## After Release

### Download Link

Once published, the APK will be available at:
```
https://github.com/asm2212/unimeal-cafe-app/releases/download/v1.0.3/unimeal-cafe-v1.0.3.apk
```

### Update Documentation

Update the following files with the new download link:
- `README.md`
- `DOWNLOAD_INSTRUCTIONS.md`
- `INSTALLATION_GUIDE_FOR_CAFE_OWNERS.md`

### Share with Users

Create a simple download page or share this link:
```
https://github.com/asm2212/unimeal-cafe-app/releases/latest
```

This will always point to the latest release.

## Release Notes Template

Here's what to include in the GitHub release description:

```markdown
# UniMeal Cafe App v1.0.3

## 🐛 Bug Fixes

### QR Code Functionality
- **Fixed QR Code Download**: Resolved issues with saving QR codes to device gallery
- **Fixed QR Code Print**: Resolved printing functionality issues with improved HTML layout

### Improvements
- Enhanced error handling and user feedback
- Updated FileSystem API for better compatibility
- Improved permission handling for media library access

## 📥 Download

Download the APK file below and install on your Android device.

**Requirements:**
- Android 7.0 (API 24) or higher
- Allow installation from unknown sources

## 📋 Installation

1. Download `unimeal-cafe-v1.0.3.apk`
2. Open the file on your Android device
3. Allow installation from unknown sources if prompted
4. Follow the installation wizard

## 🔄 Upgrading from v1.0.2

Simply install this version over the existing app. Your data will be preserved.

## 📚 Documentation

- [Installation Guide](INSTALLATION_GUIDE_FOR_CAFE_OWNERS.md)
- [Release Notes](RELEASE_NOTES_v1.0.3.md)
- [Deployment Guide](DEPLOYMENT_GUIDE.md)

## 🐞 Known Issues

None reported.

## 📞 Support

For issues or questions, please open an issue on GitHub.
```

## Verification

After creating the release:

1. ✅ Check the release page is visible
2. ✅ Download the APK and verify it downloads correctly
3. ✅ Test installation on a device
4. ✅ Verify QR code download works
5. ✅ Verify QR code print works

## Troubleshooting

### GitHub Actions Build Fails

If the automated build fails:
- Check the Actions tab for error logs
- Ensure all dependencies are in package.json
- Verify the Android build configuration

### Can't Create Release

- Ensure you have write permissions to the repository
- Verify the tag exists: `git tag -l`
- Check you're logged into the correct GitHub account

### APK Too Large

If the APK is larger than 2GB:
- GitHub has a 2GB file size limit
- Consider using GitHub LFS (Large File Storage)
- Or host the APK elsewhere and link to it

## Alternative Distribution Methods

If GitHub releases don't work:

1. **Google Drive:**
   - Upload APK to Google Drive
   - Set sharing to "Anyone with the link"
   - Share the link

2. **Firebase App Distribution:**
   - Free for small teams
   - Better analytics
   - Automatic updates

3. **Your Own Server:**
   - Host on your web server
   - Direct download link

---

**Last Updated:** November 9, 2024
**Version:** 1.0.3
