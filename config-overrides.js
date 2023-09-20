const webpack = require('webpack');

module.exports = function override(config, env) {
    // Resolve the node modules for the required polyfills
    config.resolve.fallback = {
        ...config.resolve.fallback,
        "crypto": require.resolve("crypto-browserify"),
        "url": require.resolve("url/"),
        "http": require.resolve("stream-http"),
        "https": require.resolve("https-browserify"),
        "zlib": require.resolve("browserify-zlib"),
        "stream": require.resolve("stream-browserify"),
        "buffer": require.resolve("buffer/")  // <- Add this line
    };

    // Provide the process shim and Buffer
    config.plugins.push(
        new webpack.ProvidePlugin({
            process: 'process/browser',
            Buffer: ['buffer', 'Buffer']  // <- Add this line
        })
    );

    // Alias process to the installed package for browser compatibility
    config.resolve.alias = {
        ...config.resolve.alias,
        process: "process/browser"
    };

    return config;
}
