// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Add support for `.riv` files
config.resolver.assetExts.push("riv");

// Prefer CJS over ESM so packages like zustand v5 don't pull in
// .mjs files that use `import.meta.env` (which Metro can't execute
// in its non-module bundle output).
config.resolver.unstable_conditionNames = ['require', 'react-native', 'browser'];

module.exports = config;
