// Generated using webpack-cli https://github.com/webpack/webpack-cli

const path = require('path');
const webpack = require('webpack');
const nodeConfig = {
    entry: {
        'plebbit-js': [`./src/index.js`],
    },
    target: "node",
    output: {
        path: path.resolve(__dirname, 'node_dist'),
        // library: {"name": "plebbit-js", type},
        clean: true,
        filename: `build/[name].js`,
        sourceMapFilename: 'build/[name].js.map'
    },


};

const browserConfig = {
    entry: {
        'plebbit-js': [`./src/index.js`],
    },
    target: "web",
    devtool: 'eval',
    output: {
        path: path.resolve(__dirname, 'browser_dist'),
        library: {"name": "plebbit-js", type: "umd"},
        clean: true,
        filename: `build/[name].js`,
    },
    resolve: {
        fallback: {
            "crypto": require.resolve("browser-crypto/"),
            "assert": require.resolve("assert/"),
            "path": require.resolve("path-browserify/"),
            'buffer': require.resolve('buffer/'),
            "knex": false,
            "stream": false,
            "util": false,
            "os": false,
            "url": false,
            "fs": false,
            "timers": false,
            "tty": false,
        },
        alias: {
            'knex': false,
        }
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/i,
                loader: 'babel-loader',
            },
            {
                test: /\.m?js/,
                resolve: {
                    fullySpecified: false
                },

            }
        ],
    },

    plugins: [
        new webpack.ProvidePlugin({
            process: 'process/browser',
        }), new webpack.ProvidePlugin({
            Buffer: ['buffer', 'Buffer'],
        })],


};

module.exports = [
    // nodeConfig,

    browserConfig];
