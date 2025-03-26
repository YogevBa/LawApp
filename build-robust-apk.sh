#!/bin/bash

echo "📱 Starting Robust APK build process for LawApp..."

# Try to find Java installations
function find_java() {
    echo "🔍 Searching for Java 11+ installations..."
    
    # Check some common locations
    JAVA_PATHS=(
        "/Applications/Android Studio.app/Contents/jbr/Contents/Home"
        "/Library/Java/JavaVirtualMachines"
        "$HOME/Library/Java/JavaVirtualMachines"
        "/usr/libexec/java_home -v 11"
        "/usr/libexec/java_home -v 17"
    )
    
    for path in "${JAVA_PATHS[@]}"; do
        if [[ $path == "/usr/libexec/java_home"* ]]; then
            # Try to get Java home using the java_home command
            JAVA_PATH=$($path 2>/dev/null)
            if [ $? -eq 0 ] && [ -d "$JAVA_PATH" ]; then
                echo "✓ Found Java at: $JAVA_PATH"
                export JAVA_HOME="$JAVA_PATH"
                return 0
            fi
        elif [ -d "$path" ]; then
            if [[ $path == *"JavaVirtualMachines"* ]]; then
                # Look for JDKs in the JavaVirtualMachines directory
                for jdk in "$path"/*; do
                    if [ -d "$jdk/Contents/Home" ]; then
                        echo "✓ Found Java at: $jdk/Contents/Home"
                        export JAVA_HOME="$jdk/Contents/Home"
                        return 0
                    fi
                done
            else
                # Direct path check
                echo "✓ Found Java at: $path"
                export JAVA_HOME="$path"
                return 0
            fi
        fi
    done
    
    echo "❌ Could not find a suitable Java installation."
    return 1
}

# Find Java
find_java

if [ -z "$JAVA_HOME" ]; then
    echo "❌ Error: Could not find a suitable Java installation."
    echo "Please install Java 11 or later and try again."
    exit 1
fi

echo "🔧 Using Java from: $JAVA_HOME"
echo "🔧 Java version:"
"$JAVA_HOME/bin/java" -version

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
JAVA_HOME="$JAVA_HOME" ./gradlew clean

# Build the debug APK
echo "🏗️ Building APK (this may take several minutes)..."
JAVA_HOME="$JAVA_HOME" ./gradlew assembleDebug

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