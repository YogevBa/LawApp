#!/usr/bin/env node

// This script fixes issues with expo-router setup

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing Expo Router setup...');

try {
  // Clear caches
  console.log('Clearing caches...');
  const commands = [
    'watchman watch-del-all',
    'rm -rf node_modules/.cache',
    'rm -rf $TMPDIR/metro-*',
    'rm -rf $TMPDIR/react-*',
    'rm -rf $TMPDIR/haste-*',
  ];

  commands.forEach(cmd => {
    try {
      execSync(cmd, { stdio: 'inherit' });
    } catch (error) {
      console.log(`Skipping command: ${cmd}`);
    }
  });

  // Make sure the entry point in package.json is configured correctly
  console.log('Verifying package.json...');
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  const packageData = require(packageJsonPath);
  if (packageData.main !== 'expo-router/entry') {
    packageData.main = 'expo-router/entry';
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageData, null, 2));
    console.log('Updated package.json main entry to use expo-router/entry');
  }

  console.log('✅ Router fix complete!');
  console.log('');
  console.log('Next steps:');
  console.log('1. Run "npm run clear-cache" to start with a clean cache');
  console.log('2. Make sure you have only one index.js or index.tsx file in your app directory');

} catch (error) {
  console.error('❌ Error fixing router:', error);
}