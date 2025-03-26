#!/bin/bash

echo "📱 Starting APK build process for LawApp..."

# Install EAS CLI if not already installed
if ! command -v eas &> /dev/null; then
    echo "🔍 EAS CLI not found, installing..."
    npm install -g eas-cli
fi

echo "🔧 Configuring build environment..."

# Create a local build using EAS
echo "🏗️ Building APK (this may take a few minutes)..."
npx eas build --platform android --profile apk --local

echo "✅ Build complete! Your APK should be available in the build output directory."
echo "📲 You can install this APK directly on your Android device."