// Generated using webpack-cli https://github.com/webpack/webpack-cli

const path = require('path');
const webpack = require('webpack');
const isProduction = process.env.NODE_ENV === 'production';


const config = {
    entry: {
        'plebbit-js': [`./src/index.js`],
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        clean: true,
        filename: `[name].min.js`,

    },

    plugins: [
        new webpack.ProvidePlugin({
            process: 'process/browser',
        }),],
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
    resolve: {
        fallback: {
            "crypto": require.resolve("browser-crypto"),
            "assert": require.resolve("assert/"),
            "path": require.resolve("path-browserify"),
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
            process: "process/browser"
        }
    }
};

module.exports = () => {
    if (isProduction) {
        config.mode = 'production';


    } else {
        config.mode = 'development';
    }
    return config;
};
