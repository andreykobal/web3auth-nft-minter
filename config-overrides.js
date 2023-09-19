const path = require('path');

module.exports = function override(config, env) {
    // Resolve the node modules for the required polyfills
    config.resolve.fallback = {
        ...config.resolve.fallback,  // Make sure to spread the existing configuration
        "crypto": require.resolve("crypto-browserify"),
        "url": require.resolve("url/"),
        "http": require.resolve("stream-http"),
        "https": require.resolve("https-browserify"),
        "zlib": require.resolve("browserify-zlib"),
        "stream": require.resolve("stream-browserify"), 

    };

    return config;
}
