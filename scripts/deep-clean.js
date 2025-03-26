#!/usr/bin/env node

/**
 * This script performs a deep clean of the project to resolve router and caching issues
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧹 Deep cleaning project...');

try {
  console.log('Clearing caches and temporary files...');
  const commands = [
    'watchman watch-del-all',
    'rm -rf node_modules/.cache',
    'rm -rf $TMPDIR/metro-*',
    'rm -rf $TMPDIR/react-*',
    'rm -rf $TMPDIR/haste-*',
    'rm -rf $TMPDIR/metro-bundler-cache-*',
  ];

  commands.forEach(cmd => {
    try {
      execSync(cmd, { stdio: 'inherit' });
    } catch (error) {
      console.log(`Skipping command: ${cmd}`);
    }
  });

  // Remove conflicting index.tsx if it exists
  const indexTsxPath = path.join(process.cwd(), 'app', 'index.tsx');
  if (fs.existsSync(indexTsxPath)) {
    console.log('Removing conflicting index.tsx file...');
    fs.unlinkSync(indexTsxPath);
  }

  // Reset babel.config.js to ensure it's properly formatted
  console.log('Checking babel.config.js...');
  const babelConfigPath = path.join(process.cwd(), 'babel.config.js');
  const babelConfig = `module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'expo-router/babel',
      ['module:react-native-dotenv', {
        moduleName: '@env',
        path: '.env',
        safe: false,
        allowUndefined: true,
      }],
    ],
  };
};
`;
  fs.writeFileSync(babelConfigPath, babelConfig);

  // Make sure App.js doesn't interfere with expo-router
  console.log('Updating App.js...');
  const appJsPath = path.join(process.cwd(), 'App.js');
  const appJsContent = `// This file is not used when expo-router is active
// All routing is handled by the files in the app/ directory
// See app/_layout.tsx and app/index.js
export default function App() {
  return null;
}
`;
  fs.writeFileSync(appJsPath, appJsContent);

  // Verify package.json main entry
  console.log('Verifying package.json...');
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  const packageData = require(packageJsonPath);
  if (packageData.main !== 'expo-router/entry') {
    packageData.main = 'expo-router/entry';
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageData, null, 2));
    console.log('Updated package.json main entry to use expo-router/entry');
  }

  console.log('✅ Deep clean complete!');
  console.log('');
  console.log('Next steps:');
  console.log('1. Run "npx expo start --clear" to start with a clean slate');
  console.log('2. If that doesn\'t work, try uninstalling and reinstalling the Expo app on your device/simulator');

} catch (error) {
  console.error('❌ Error during deep clean:', error);
}