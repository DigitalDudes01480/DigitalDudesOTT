# Quick APK Build Guide - Digital Dudes

## Current Status
- ✅ Capacitor installed and configured
- ✅ Android project created
- ✅ Java 17 installed
- ❌ Android Studio not installed (required for APK build)

## Option 1: Install Android Studio (Recommended - 20 minutes)

### Step 1: Download Android Studio
1. Visit: https://developer.android.com/studio
2. Click "Download Android Studio"
3. Accept terms and download (1.1 GB)

### Step 2: Install Android Studio
1. Open the downloaded DMG file
2. Drag "Android Studio" to Applications folder
3. Open Android Studio from Applications
4. Follow setup wizard:
   - Choose "Standard" installation
   - Accept all licenses
   - Wait for SDK download (takes 10-15 minutes)

### Step 3: Build APK
```bash
# Set Java environment
export JAVA_HOME=/opt/homebrew/opt/openjdk@17
export PATH="/opt/homebrew/opt/openjdk@17/bin:$PATH"

# Open project in Android Studio
cd /Users/prajjwal/Desktop/digital-ims/frontend
npx cap open android

# In Android Studio:
# 1. Wait for Gradle sync (first time: 5-10 minutes)
# 2. Click Build → Build Bundle(s) / APK(s) → Build APK(s)
# 3. Wait for build (2-5 minutes)
# 4. Click "locate" to find APK
```

### Step 4: Deploy APK
```bash
cd /Users/prajjwal/Desktop/digital-ims/frontend

# Copy APK
cp android/app/build/outputs/apk/debug/app-debug.apk public/downloads/digital-dudes.apk

# Update download page (remove "Coming Soon" message)
# Edit: src/pages/DownloadApp.jsx

# Deploy
npm run build
vercel --prod
```

## Option 2: Use Command Line (After Android Studio Install)

```bash
# Set environment
export JAVA_HOME=/opt/homebrew/opt/openjdk@17
export PATH="/opt/homebrew/opt/openjdk@17/bin:$PATH"

# Create local.properties (after Android Studio installs SDK)
cd /Users/prajjwal/Desktop/digital-ims/frontend/android
echo "sdk.dir=/Users/prajjwal/Library/Android/sdk" > local.properties

# Build APK
./gradlew assembleDebug

# Copy to downloads
cd ..
cp android/app/build/outputs/apk/debug/app-debug.apk public/downloads/digital-dudes.apk

# Deploy
npm run build
vercel --prod
```

## Option 3: Online APK Builder (No Installation - 5 minutes)

### Using AppGyver / Capacitor Cloud Build
1. Visit: https://build.capacitorjs.com (if available)
2. Or use: https://appgyver.com

### Manual Alternative - EAS Build (Expo)
```bash
npm install -g eas-cli
eas build --platform android
```

## Troubleshooting

### "SDK location not found"
- Install Android Studio first
- SDK will be at: `/Users/prajjwal/Library/Android/sdk`

### "Java not found"
```bash
export JAVA_HOME=/opt/homebrew/opt/openjdk@17
export PATH="/opt/homebrew/opt/openjdk@17/bin:$PATH"
```

### Build fails
```bash
cd android
./gradlew clean
./gradlew assembleDebug --stacktrace
```

## Quick Test Without Building

For testing the download flow without building APK:

```bash
cd /Users/prajjwal/Desktop/digital-ims/frontend/public/downloads

# Create a dummy APK (just for testing UI)
echo "This is a test APK file" > digital-dudes.apk

# Deploy
cd ../..
npm run build
vercel --prod
```

This will make the download button work (though it won't be a real APK).

## Estimated Time

- **With Android Studio:** 30-40 minutes total
  - Download: 5 min
  - Install: 5 min
  - SDK download: 15 min
  - First build: 10 min

- **Command line only:** 15 minutes (after Studio installed)

- **Test dummy APK:** 2 minutes

## Next Steps

1. **Decide on approach** (Android Studio recommended)
2. **Follow steps above**
3. **Test APK on Android device**
4. **Update download page** to enable button
5. **Deploy to production**

## Support

If you get stuck:
- Check BUILD_APK_INSTRUCTIONS.md for detailed guide
- Android Studio docs: https://developer.android.com/studio/run
- Capacitor docs: https://capacitorjs.com/docs/android
