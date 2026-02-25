# Development Setup Guide

## 🛠️ Enable React Native Dev Tools

### On Android Emulator:
- Press `Cmd + M` (Mac) or `Ctrl + M` (Windows/Linux)
- This opens the React Native Dev Menu

### Dev Menu Options:
- **Reload** - Reload the app
- **Debug** - Open Chrome DevTools
- **Enable Fast Refresh** - Auto-reload on code changes
- **Show Inspector** - Inspect UI elements
- **Show Perf Monitor** - Performance monitoring

### View Logs in Real-Time:
```bash
# Android logs
npx react-native log-android

# Or use adb directly
adb logcat *:S ReactNative:V ReactNativeJS:V
```

### Start Metro with Reset Cache:
```bash
npm start -- --reset-cache
# or
bun start -- --reset-cache
```

---

## 🎨 Generate App Icons from SVG Logo

### Step 1: Install ImageMagick
```bash
brew install imagemagick
```

### Step 2: Generate Icons
Run this command to generate all Android icon sizes:

```bash
cd /Users/ashokverma/Documents/TechRover/elora-web/public

# Generate all icon sizes
for size in 48:mdpi 72:hdpi 96:xhdpi 144:xxhdpi 192:xxxhdpi; do
  IFS=':' read -r pixels dpi <<< "$size"
  magick convert -background white -resize ${pixels}x${pixels} logo.svg /Users/ashokverma/Documents/TechRover/EloraCraftingArts/android/app/src/main/res/mipmap-${dpi}/ic_launcher.png
  magick convert -background white -resize ${pixels}x${pixels} logo.svg /Users/ashokverma/Documents/TechRover/EloraCraftingArts/android/app/src/main/res/mipmap-${dpi}/ic_launcher_round.png
done
```

### Step 3: Rebuild the App
```bash
cd /Users/ashokverma/Documents/TechRover/EloraCraftingArts
cd android && ./gradlew clean && cd ..
bun android
```

---

## 🚀 Quick Start Commands

### Start Development:
```bash
# Terminal 1: Start Metro bundler
npm start

# Terminal 2: Run on Android
bun android
```

### Clean Build:
```bash
# Clean everything
npm run clean
cd android && ./gradlew clean && cd ..
rm -rf /tmp/metro-* /tmp/haste-*
watchman watch-del-all

# Rebuild
bun android
```

### Debug Commands:
```bash
# View Android logs
adb logcat | grep -i "ReactNative\|ReactNativeJS"

# Check connected devices
adb devices

# Restart ADB
adb kill-server && adb start-server

# Uninstall app
adb uninstall com.eloracraftingarts
```

---

## 📱 Keyboard Shortcuts

### Android Emulator:
- `Cmd + M` - Dev Menu
- `R + R` - Reload
- `Cmd + D` - Debug Menu

### Chrome DevTools:
- Open Dev Menu → Debug
- Or navigate to: `chrome://inspect`

---

## 🐛 Troubleshooting

### Metro Bundler Issues:
```bash
# Clear cache and restart
rm -rf /tmp/metro-* /tmp/haste-*
watchman watch-del-all
npm start -- --reset-cache
```

### Build Issues:
```bash
# Clean Android build
cd android && ./gradlew clean && cd ..

# Clean node modules
rm -rf node_modules && bun install
```

### App Not Launching:
```bash
# Check if app is installed
adb shell pm list packages | grep elora

# Force stop and restart
adb shell am force-stop com.eloracraftingarts
adb shell am start -n com.eloracraftingarts/.MainActivity
```
