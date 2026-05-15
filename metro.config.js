// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Add support for `.riv` files
config.resolver.assetExts.push("riv");

// Prefer CJS over ESM so packages like zustand v5 don't pull in
// .mjs files that use `import.meta.env` (which Metro can't execute
// in its non-module bundle output).
config.resolver.unstable_conditionNames = ['require', 'react-native', 'browser'];
config.resolver.unstable_enablePackageExports = false;

// Zustand v5+ uses import.meta.env in its ESM build, which breaks React Native Web
// because Metro doesn't natively support import.meta. We force Metro to resolve
// Zustand to its CommonJS build instead, which uses process.env.NODE_ENV.
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform === 'web' && moduleName.startsWith('zustand')) {
    // If importing just 'zustand', point to the CJS index
    if (moduleName === 'zustand') {
      return {
        filePath: path.resolve(__dirname, 'node_modules/zustand/index.js'),
        type: 'sourceFile',
      };
    }
    // If importing a specific module like 'zustand/middleware'
    const subModule = moduleName.replace('zustand/', '');
    return {
      filePath: path.resolve(__dirname, `node_modules/zustand/${subModule}.js`),
      type: 'sourceFile',
    };
  }
  
  // Optionally fallback to default resolver
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
