# LawApp - Android Build Instructions

Follow these steps to build a working APK for the LawApp application:

## Prerequisites

1. Make sure you have installed:
   - Node.js (16.x or later)
   - npm (8.x or later)
   - Java 11 or newer

## Build Steps

### 1. Install Dependencies

```bash
npm install
```

### 2. Apply Patches

We need to apply some patches to fix build issues with Expo modules:

```bash
npm run apply-patches
```

### 3. Prebuild the App

This step generates the native Android project files:

```bash
npm run prebuild
```

### 4. Build the APK

Choose one of the following methods:

#### a) Using EAS Cloud Build (Recommended)

```bash
npm run build:apk
```

This will build the APK on Expo's servers and provide a download link.

#### b) Local Build

If you prefer to build locally:

```bash
npm run build:robust-apk
```

This script will automatically:
- Find a suitable Java installation
- Set up the environment
- Build the debug APK

The final APK will be located at: `android/app/build/outputs/apk/debug/app-debug.apk`

## Troubleshooting

If you encounter build errors:

1. Check that you've applied the patches using `npm run apply-patches`
2. Ensure Java 11+ is installed and available in your PATH
3. Try running `npx expo install --fix` to fix dependency issues
4. Clean the build directory with `cd android && ./gradlew clean`

## Installation on Android Device

1. Enable "Install from Unknown Sources" in your Android settings
2. Transfer the APK to your device
3. Tap the APK file to install