# 📱 UniMeal Cafe App

Digital cafeteria management system for cafe owners. Manage students, process transactions, and track revenue efficiently.

![Version](https://img.shields.io/badge/version-2.1.0-orange)
![Platform](https://img.shields.io/badge/platform-Android-green)
![License](https://img.shields.io/badge/license-MIT-blue)

## ✨ Features

- 👥 **Student Management** - Register and manage students with ease
- 🔍 **Permanent QR Code System** - Generate permanent QR codes that never expire
- 💰 **Transaction Processing** - Process meal transactions instantly
- 💳 **Balance Management** - Manage student balances and top-ups
- 📊 **Revenue Tracking** - Track daily, weekly, and monthly revenue
- 📜 **Transaction History** - Complete transaction history with filters
- 🖨️ **Print QR Codes** - Print QR codes directly without extra text
- 🎨 **Beautiful UI** - Modern orange-themed interface with smooth animations
- 📱 **Fully Responsive** - Optimized for all screen sizes

## 📥 Download

**Latest Release:** [v2.1.0](https://github.com/asm2212/unimeal-cafe-app/releases/latest)

**Direct APK Download:** [app-release.apk](https://github.com/asm2212/unimeal-cafe-app/releases/download/v2.1.0/app-release.apk)

## 📋 Requirements

- **Android:** 7.0 or higher (API 24+)
- **Storage:** 200 MB free space
- **Internet:** Required for app functionality

## 🚀 Installation

### For Cafe Owners:

1. **Download** the APK from the link above
2. **Enable Unknown Sources:**
   - Go to Settings → Security
   - Enable "Install from Unknown Sources"
3. **Install** the downloaded APK
4. **Login** with your cafe owner credentials

## 📱 Screenshots

| Dashboard | Students | QR Code | Transactions |
|-----------|----------|---------|--------------|
| Cafe overview with stats | Student list and management | Generate QR codes | Transaction history |

## 🔧 Technical Stack

- **Framework:** React Native 0.81.5
- **Platform:** Expo SDK 54
- **Architecture:** New Architecture enabled
- **Language:** TypeScript
- **State Management:** React Hooks
- **Navigation:** Expo Router
- **Styling:** NativeWind (Tailwind CSS)
- **Icons:** Expo Vector Icons
- **Min SDK:** 24 (Android 7.0)
- **Target SDK:** 35 (Android 14)

## 🏗️ Project Structure

```
unimeal-cafe-app/
├── app/                    # App screens (Expo Router)
│   ├── (tabs)/            # Tab navigation screens
│   │   ├── dashboard.tsx  # Main dashboard
│   │   ├── students.tsx   # Student management
│   │   ├── qr-code.tsx    # QR code generation
│   │   ├── transactions.tsx # Transaction history
│   │   └── more.tsx       # More options
│   ├── login.tsx          # Login screen
│   ├── register-student.tsx # Student registration
│   └── ...
├── services/              # API services
│   └── api.ts            # API client
├── constants/            # App constants
├── android/              # Android native code
└── ios/                  # iOS native code
```

## 🔐 Authentication

The app uses JWT-based authentication with the UniMeal backend API.

**Default API Endpoint:** Configure in `.env` file:
```env
EXPO_PUBLIC_API_URL=https://your-backend-api.com
```

## 🛠️ Development

### Prerequisites

- Node.js 18+
- npm or yarn
- Android Studio (for Android development)
- Expo CLI

### Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/asm2212/unimeal-cafe-app.git
   cd unimeal-cafe-app
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your API URL
   ```

4. **Start development server:**
   ```bash
   npm start
   ```

5. **Run on Android:**
   ```bash
   npm run android
   ```

### Building APK

```bash
cd android
./gradlew :app:assembleRelease
```

APK will be generated at: `android/app/build/outputs/apk/release/app-release.apk`

## 🔄 Updates

To update the app:

1. Download the latest APK from [Releases](https://github.com/asm2212/unimeal-cafe-app/releases)
2. Install over the existing app
3. Your data will be preserved

## 🆘 Support

Need help?

- 📧 **Email:** asmareadmasu0@gmail.com
- 📱 **Phone:** +251 945 906 550
- 🐛 **Issues:** [GitHub Issues](https://github.com/asm2212/unimeal-cafe-app/issues)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Built with [React Native](https://reactnative.dev/)
- Powered by [Expo](https://expo.dev/)
- UI inspired by modern design principles

## 📊 Version History

### v2.1.0 (2025-11-10)
- 🔔 **Real-time Notifications** - Dashboard now shows new transaction notifications
- 🔄 **Auto-reload Dashboard** - Dashboard auto-refreshes every 30 seconds
- 📊 **Enhanced Dashboard** - Improved stats display and insights
- 🎯 **Better UX** - Notification badge shows count of new transactions
- ⚡ **Performance** - Optimized transaction checking and loading

### v2.0.0 (2025-11-10)
- ✨ **Permanent QR Codes** - QR codes never expire until regenerated
- 🖨️ **Improved Print** - Print only QR code without extra text
- 🎨 **Smooth Animations** - Added fade and scale animations for better UX
- 📱 **Enhanced Responsiveness** - Optimized for all screen sizes
- 🗑️ **Removed Features** - Removed download and share QR options for simplicity
- 🧹 **Code Cleanup** - Removed unnecessary documentation files
- ⚡ **Performance** - Improved app speed and efficiency

### v1.0.0 (2025-11-06)
- Initial production release
- Complete cafe management features
- Student registration and management
- QR code generation and scanning
- Transaction processing
- Balance management
- Revenue tracking

---

**Made with ❤️ for cafe owners**

For the complete UniMeal ecosystem, visit: [UniMeal Backend](https://github.com/asm2212/unimeal)
