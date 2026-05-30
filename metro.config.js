// Custom Metro config to support expo-sqlite on web (loads a `.wasm` blob)
// and to add the COOP/COEP headers it requires for SharedArrayBuffer.
// See https://docs.expo.dev/versions/v56.0.0/sdk/sqlite/#usage-on-web
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Treat `.wasm` files as assets so Metro will copy and resolve them.
config.resolver.assetExts.push('wasm');

// expo-sqlite's web worker needs SharedArrayBuffer, which requires these headers.
config.server = config.server || {};
const userEnhanceMiddleware = config.server.enhanceMiddleware;
config.server.enhanceMiddleware = (middleware, server) => {
  const enhanced = userEnhanceMiddleware ? userEnhanceMiddleware(middleware, server) : middleware;
  return (req, res, next) => {
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
    enhanced(req, res, next);
  };
};

module.exports = config;
