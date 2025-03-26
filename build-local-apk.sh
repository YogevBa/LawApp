#!/bin/bash

echo "📱 Starting Local APK build process for LawApp..."

# Set JAVA_HOME to Android Studio's JDK
export JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"
echo "🔧 Using Java from: $JAVA_HOME"

# Navigate to the android directory
cd "$(dirname "$0")/android"

# Check if we're in the right directory
if [ ! -f "./gradlew" ]; then
    echo "❌ Error: Could not find gradlew script. Make sure you're in the right directory."
    exit 1
fi

# Make gradlew executable
chmod +x ./gradlew

# Clean the project first
echo "🧹 Cleaning previous builds..."
./gradlew clean

# Build the debug APK
echo "🏗️ Building APK (this may take several minutes)..."
./gradlew assembleDebug

# Check the result
if [ $? -eq 0 ]; then
    APK_PATH="./app/build/outputs/apk/debug/app-debug.apk"
    if [ -f "$APK_PATH" ]; then
        ABSOLUTE_PATH=$(cd "$(dirname "$APK_PATH")" && pwd)/$(basename "$APK_PATH")
        echo ""
        echo "✅ APK built successfully!"
        echo "📂 Your APK is located at: $ABSOLUTE_PATH"
        echo ""
        echo "To install on your Android device:"
        echo "1. Transfer this APK to your Android device"
        echo "2. On your Android device, enable 'Install from Unknown Sources' in Settings"
        echo "3. Navigate to the APK file and tap to install"
    else
        echo "❌ Error: APK was not created at the expected location."
    fi
else
    echo "❌ Error: APK build failed. Check the error messages above."
fi