# Elora Crafting Arts - Mobile App

Professional branding solutions from design to installation.

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ 
- Java 15+ (for Android builds)
- Android Studio with SDK 33
- React Native CLI

### Installation

```bash
# Install dependencies
npm install --legacy-peer-deps

# For iOS (macOS only)
cd ios && pod install && cd ..

# Start Metro bundler
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios
```

## 📱 Building for Production

### Android APK (for testing)
```bash
npm run build:apk
```

### Android AAB (for Play Store)
```bash
npm run build:aab
```

### Complete Release Build
```bash
./build-release.sh
```

## 🏪 Play Store Deployment

### 1. Generate Release Keystore
```bash
cd android/app
keytool -genkeypair -v -storetype PKCS12 -keystore elora-release-key.keystore -alias elora-key-alias -keyalg RSA -keysize 2048 -validity 10000
```

### 2. Configure Signing
Add to `android/gradle.properties`:
```properties
MYAPP_UPLOAD_STORE_FILE=elora-release-key.keystore
MYAPP_UPLOAD_KEY_ALIAS=elora-key-alias
MYAPP_UPLOAD_STORE_PASSWORD=your_keystore_password
MYAPP_UPLOAD_KEY_PASSWORD=your_key_password
```

### 3. Build Release AAB
```bash
npm run build:aab
```

### 4. Upload to Play Console
- Upload `android/app/build/outputs/bundle/release/app-release.aab`
- Fill in app details, screenshots, and descriptions
- Submit for review

## 🔧 Configuration

### App Details
- **Package Name**: com.eloracraftingarts
- **Version**: 1.0.0 (versionCode: 1)
- **Min SDK**: 21 (Android 5.0)
- **Target SDK**: 33 (Android 13)
- **Compile SDK**: 33

### Features
- ✅ Authentication & Authorization
- ✅ Dashboard & Analytics
- ✅ Store Management
- ✅ User Management
- ✅ Role-based Access Control
- ✅ Enquiry Management
- ✅ Offline Support
- ✅ Push Notifications Ready

### Dependencies
- React Native 0.72.10
- React Navigation 6.x
- Axios for API calls
- AsyncStorage for local data
- React Native Vector Icons
- Linear Gradient support
- Gesture Handler
- Safe Area Context

## 🛠 Development Scripts

```bash
# Development
npm start                 # Start Metro bundler
npm run android          # Run Android app
npm run ios             # Run iOS app

# Building
npm run build:apk       # Build APK for testing
npm run build:aab       # Build AAB for Play Store
npm run build:android   # Generate Android bundle

# Maintenance
npm run clean           # Clean build cache
npm run pod_install     # Install iOS pods
npm test               # Run tests
npm run lint           # Run ESLint
```

## 📁 Project Structure

```
EloraCraftingArts/
├── src/
│   ├── components/     # Reusable UI components
│   ├── context/       # React Context providers
│   ├── lib/          # API and utilities
│   ├── navigation/   # Navigation configuration
│   ├── screens/      # App screens
│   └── theme/        # Colors and styling
├── android/          # Android native code
├── ios/             # iOS native code
└── build-release.sh # Release build script
```

## 🔐 Security Features

- JWT-based authentication
- Secure API communication
- Role-based access control
- Input validation
- Secure storage for sensitive data

## 📊 Performance Optimizations

- Hermes JavaScript engine enabled
- ProGuard/R8 optimization for release builds
- Bundle splitting for faster loading
- Image optimization
- Memory leak prevention

## 🐛 Troubleshooting

### Common Issues

1. **Build fails with Java version error**
   - Ensure Java 15+ is installed
   - Set JAVA_HOME environment variable

2. **Metro bundler issues**
   - Run `npx react-native start --reset-cache`
   - Clear node_modules and reinstall

3. **Android build fails**
   - Clean build: `cd android && ./gradlew clean`
   - Check Android SDK installation

4. **Dependencies conflicts**
   - Use `npm install --legacy-peer-deps`
   - Clear npm cache: `npm cache clean --force`

## 📞 Support

For technical support and inquiries:
- Email: support@eloracraftingarts.com
- Website: https://eloracraftingarts.com

## 📄 License

© 2026 Elora Crafting Arts. All rights reserved.