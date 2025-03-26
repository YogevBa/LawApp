#!/bin/bash

echo "📱 Starting Cloud APK build process for LawApp..."

# Install EAS CLI if not already installed
if ! command -v eas &> /dev/null; then
    echo "🔍 EAS CLI not found, installing..."
    npm install -g eas-cli
fi

# Login to Expo (required for cloud builds)
echo "🔑 Please login to your Expo account (or create one if needed)..."
npx eas login

# Create a build on Expo's servers
echo "🏗️ Building APK on Expo's servers (this may take 10-15 minutes)..."
echo "⏳ You'll receive a download link when the build is complete."
npx eas build -p android --profile apk

echo "✅ Build process initiated!"
echo "📲 Once complete, you'll be able to download and install the APK on your Android device."