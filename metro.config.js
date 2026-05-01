const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Firebase v11+ requires .mjs and .cjs support
config.resolver.sourceExts.push('mjs', 'cjs');

module.exports = config;
