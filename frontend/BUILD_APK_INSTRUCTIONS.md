# Building the Digital Dudes Android APK

## Prerequisites

### 1. Install Android Studio
Download and install Android Studio from: https://developer.android.com/studio

### 2. Install Java JDK 17
Already installed via Homebrew:
```bash
brew install openjdk@17
```

Set JAVA_HOME:
```bash
export JAVA_HOME=/opt/homebrew/opt/openjdk@17
export PATH="/opt/homebrew/opt/openjdk@17/bin:$PATH"
```

Add to ~/.zshrc for permanent setup:
```bash
echo 'export JAVA_HOME=/opt/homebrew/opt/openjdk@17' >> ~/.zshrc
echo 'export PATH="/opt/homebrew/opt/openjdk@17/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

### 3. Set Android SDK Location
Create `android/local.properties` file:
```bash
cd /Users/prajjwal/Desktop/digital-ims/frontend/android
echo "sdk.dir=/Users/prajjwal/Library/Android/sdk" > local.properties
```

Or if Android Studio is installed in a different location, find your SDK path:
- Open Android Studio
- Go to Preferences → Appearance & Behavior → System Settings → Android SDK
- Copy the "Android SDK Location" path
- Use that path in local.properties

## Building the APK

### Option 1: Using Android Studio (Easiest)

1. Open Android Studio
2. Click "Open an existing project"
3. Navigate to: `/Users/prajjwal/Desktop/digital-ims/frontend/android`
4. Wait for Gradle sync to complete
5. Click **Build** → **Build Bundle(s) / APK(s)** → **Build APK(s)**
6. Wait for build to complete (2-5 minutes)
7. Click "locate" in the notification
8. APK will be at: `android/app/build/outputs/apk/debug/app-debug.apk`

### Option 2: Using Command Line

```bash
cd /Users/prajjwal/Desktop/digital-ims/frontend

# Ensure latest build
npm run build
npx cap sync android

# Build APK
cd android
./gradlew assembleDebug

# APK location:
# android/app/build/outputs/apk/debug/app-debug.apk
```

## Deploying the APK

### 1. Copy APK to Public Folder
```bash
cd /Users/prajjwal/Desktop/digital-ims/frontend
cp android/app/build/outputs/apk/debug/app-debug.apk public/downloads/digital-dudes.apk
```

### 2. Rebuild and Deploy
```bash
npm run build
vercel --prod
```

### 3. Test Download
Visit: https://frontend-virid-nu-28.vercel.app/download

## Building Release APK (For Production)

### 1. Generate Signing Key
```bash
keytool -genkey -v -keystore digital-dudes-release.keystore -alias digital-dudes -keyalg RSA -keysize 2048 -validity 10000
```

### 2. Configure Signing in android/app/build.gradle
Add before `buildTypes`:
```gradle
signingConfigs {
    release {
        storeFile file('digital-dudes-release.keystore')
        storePassword 'YOUR_STORE_PASSWORD'
        keyAlias 'digital-dudes'
        keyPassword 'YOUR_KEY_PASSWORD'
    }
}
```

Update release buildType:
```gradle
buildTypes {
    release {
        signingConfig signingConfigs.release
        minifyEnabled false
        proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
    }
}
```

### 3. Build Release APK
```bash
cd android
./gradlew assembleRelease

# APK location:
# android/app/build/outputs/apk/release/app-release.apk
```

## Troubleshooting

### "SDK location not found"
Create `android/local.properties`:
```
sdk.dir=/Users/prajjwal/Library/Android/sdk
```

### "Java not found"
```bash
export JAVA_HOME=/opt/homebrew/opt/openjdk@17
export PATH="/opt/homebrew/opt/openjdk@17/bin:$PATH"
```

### Gradle build fails
```bash
cd android
./gradlew clean
./gradlew assembleDebug --stacktrace
```

### APK size too large
Use release build with minification:
```bash
./gradlew assembleRelease
```

## App Information

- **App Name:** Digital Dudes
- **Package ID:** com.digitaldudes.ott
- **Version:** 1.0.0
- **Min SDK:** Android 7.0 (API 24)
- **Target SDK:** Android 14 (API 34)

## Download Page

Once APK is built and deployed:
- **Download URL:** https://frontend-virid-nu-28.vercel.app/download
- **Direct APK:** https://frontend-virid-nu-28.vercel.app/downloads/digital-dudes.apk

## Notes

- Debug APK is for testing only (larger size, not optimized)
- Release APK is for production (smaller, optimized, requires signing)
- APK will load the live website (https://frontend-virid-nu-28.vercel.app)
- No need to rebuild APK when website updates
