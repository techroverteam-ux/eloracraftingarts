#!/bin/bash

# EloraCraftingArts Mobile App - Enhanced Setup Script

echo "🚀 Setting up Enhanced EloraCraftingArts Mobile App..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the EloraCraftingArts root directory"
    exit 1
fi

echo "📦 Installing new dependencies..."
npm install @react-native-community/geolocation

echo "🍎 Installing iOS pods (if iOS directory exists)..."
if [ -d "ios" ]; then
    cd ios && pod install && cd ..
    echo "✅ iOS pods installed"
else
    echo "⚠️  iOS directory not found, skipping pod install"
fi

echo "🤖 Setting up Android permissions..."
ANDROID_MANIFEST="android/app/src/main/AndroidManifest.xml"
if [ -f "$ANDROID_MANIFEST" ]; then
    # Check if permissions already exist
    if ! grep -q "ACCESS_FINE_LOCATION" "$ANDROID_MANIFEST"; then
        echo "Adding Android permissions..."
        # This would need manual addition - showing instructions instead
        echo "⚠️  Please manually add these permissions to $ANDROID_MANIFEST:"
        echo "    <uses-permission android:name=\"android.permission.ACCESS_FINE_LOCATION\" />"
        echo "    <uses-permission android:name=\"android.permission.ACCESS_COARSE_LOCATION\" />"
        echo "    <uses-permission android:name=\"android.permission.CAMERA\" />"
        echo "    <uses-permission android:name=\"android.permission.WRITE_EXTERNAL_STORAGE\" />"
    else
        echo "✅ Android permissions already exist"
    fi
else
    echo "⚠️  Android manifest not found"
fi

echo "🍎 Setting up iOS permissions..."
IOS_PLIST="ios/EloraCraftingArts/Info.plist"
if [ -f "$IOS_PLIST" ]; then
    if ! grep -q "NSLocationWhenInUseUsageDescription" "$IOS_PLIST"; then
        echo "⚠️  Please manually add these permissions to $IOS_PLIST:"
        echo "    <key>NSLocationWhenInUseUsageDescription</key>"
        echo "    <string>This app needs location access to capture GPS coordinates for recce reports.</string>"
        echo "    <key>NSCameraUsageDescription</key>"
        echo "    <string>This app needs camera access to take photos for recce and installation reports.</string>"
        echo "    <key>NSPhotoLibraryUsageDescription</key>"
        echo "    <string>This app needs photo library access to select images for reports.</string>"
    else
        echo "✅ iOS permissions already exist"
    fi
else
    echo "⚠️  iOS Info.plist not found"
fi

echo "🧹 Cleaning cache..."
npm run clean:cache 2>/dev/null || echo "Cache clean command not available"

echo "✅ Setup complete!"
echo ""
echo "📋 Next Steps:"
echo "1. Manually add the permissions mentioned above if needed"
echo "2. Update your navigation to use the new enhanced screens"
echo "3. Test the app on both Android and iOS devices"
echo "4. Verify GPS and camera permissions work correctly"
echo ""
echo "🚀 To start the app:"
echo "   npm run start"
echo "   npm run android  # or npm run ios"
echo ""
echo "📖 For detailed implementation guide, see:"
echo "   MOBILE_IMPLEMENTATION_COMPLETE.md"