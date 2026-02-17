#!/bin/bash

# Elora Crafting Arts - Build Script for Play Store Release
# This script builds both APK and AAB files for distribution

echo "🚀 Building Elora Crafting Arts for Play Store Release..."

# Clean previous builds
echo "🧹 Cleaning previous builds..."
cd android
./gradlew clean
cd ..

# Install dependencies
echo "📦 Installing dependencies..."
npm install --legacy-peer-deps

# Generate bundle for Android
echo "📱 Generating Android bundle..."
npx react-native bundle --platform android --dev false --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest android/app/src/main/res

# Build Release APK
echo "🔨 Building Release APK..."
cd android
./gradlew assembleRelease

# Build Release AAB (for Play Store)
echo "📦 Building Release AAB for Play Store..."
./gradlew bundleRelease

echo "✅ Build completed!"
echo ""
echo "📁 Generated files:"
echo "   APK: android/app/build/outputs/apk/release/app-release.apk"
echo "   AAB: android/app/build/outputs/bundle/release/app-release.aab"
echo ""
echo "🎯 Upload the AAB file to Google Play Console for distribution"
echo "🔧 Use the APK file for testing on devices"

cd ..