# Digital Dudes Android APK

## To Build and Deploy the APK:

1. Follow instructions in `/frontend/BUILD_APK_INSTRUCTIONS.md`
2. Build the APK using Android Studio or Gradle
3. Copy the APK file here: `public/downloads/digital-dudes.apk`
4. Rebuild and deploy the frontend

## Current Status

The APK infrastructure is ready. To complete:
- Install Android Studio
- Build the APK
- Place it in this directory
- Redeploy

## Quick Build Command

```bash
cd /Users/prajjwal/Desktop/digital-ims/frontend/android
./gradlew assembleDebug
cp app/build/outputs/apk/debug/app-debug.apk ../public/downloads/digital-dudes.apk
cd ..
npm run build
vercel --prod
```
