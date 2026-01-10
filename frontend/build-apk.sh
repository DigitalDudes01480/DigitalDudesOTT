#!/bin/bash

# Digital Dudes APK Build Script
# This script builds the Android APK and prepares it for download

echo "🚀 Digital Dudes APK Build Script"
echo "=================================="
echo ""

# Set Java environment
# Capacitor Android currently compiles with Java 21, so prefer Android Studio's bundled JDK.
ANDROID_STUDIO_JAVA="/Applications/Android Studio.app/Contents/jbr/Contents/Home"

if [ -x "$ANDROID_STUDIO_JAVA/bin/java" ]; then
    export JAVA_HOME="$ANDROID_STUDIO_JAVA"
    export PATH="$JAVA_HOME/bin:$PATH"
else
    export JAVA_HOME=/opt/homebrew/opt/openjdk@17
    export PATH="/opt/homebrew/opt/openjdk@17/bin:$PATH"
fi

# Check Java
echo "✓ Checking Java..."
java -version
if [ $? -ne 0 ]; then
    echo "❌ Java not found. Please install Android Studio (recommended) or Java."
    exit 1
fi
echo ""

# Check Android SDK
echo "✓ Checking Android SDK..."
if [ ! -d "$HOME/Library/Android/sdk" ]; then
    echo "❌ Android SDK not found."
    echo ""
    echo "Please install Android Studio first:"
    echo "1. Download from: https://developer.android.com/studio"
    echo "2. Install and run Android Studio"
    echo "3. Complete the setup wizard to install Android SDK"
    echo "4. Run this script again"
    echo ""
    exit 1
fi

# Create local.properties
echo "✓ Setting up Android SDK location..."
echo "sdk.dir=$HOME/Library/Android/sdk" > android/local.properties
echo ""

# Build the web app first
echo "✓ Building web app..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Web build failed"
    exit 1
fi
echo ""

# Sync with Capacitor
echo "✓ Syncing with Capacitor..."
npx cap sync android
echo ""

# Build APK
echo "✓ Building Android APK..."
cd android
./gradlew assembleDebug
if [ $? -ne 0 ]; then
    echo "❌ APK build failed"
    echo ""
    echo "Try running with more details:"
    echo "./gradlew assembleDebug --stacktrace"
    exit 1
fi
cd ..
echo ""

# Copy APK to downloads
echo "✓ Copying APK to downloads folder..."
mkdir -p public/downloads
cp android/app/build/outputs/apk/debug/app-debug.apk public/downloads/digital-dudes.apk
echo ""

# Get file size
APK_SIZE=$(du -h public/downloads/digital-dudes.apk | cut -f1)
echo "✅ APK built successfully!"
echo "   Location: public/downloads/digital-dudes.apk"
echo "   Size: $APK_SIZE"
echo ""

echo "📦 Next steps:"
echo "1. Test the APK on your Android device"
echo "2. Update src/pages/DownloadApp.jsx (enable download button)"
echo "3. Deploy: npm run build && vercel --prod"
echo ""
echo "🎉 Done!"
