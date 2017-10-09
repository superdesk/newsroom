const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const ManifestPlugin = require('webpack-manifest-plugin');
const NODE_MODULES = process.env.NODE_MODULES || 'node_modules';

module.exports = {
    entry: {
        newsroom_js: './assets/index.js',
        settings_js: ['babel-polyfill', './assets/settings/index.js'],
        newsroom_css: './assets/style.js',
        wire_js: ['babel-polyfill', './assets/wire/index.js'],
    },
    output: {
        path: path.resolve(__dirname, 'newsroom', 'static'),
        publicPath: 'http://localhost:8080/',
        filename: '[name].[chunkhash].js',
        chunkFilename: '[id].[chunkhash].js'
    },
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                loader: 'babel-loader',
                exclude: /node_modules/,
                options: {
                    presets: ['es2015', 'react'],
                    plugins: ['transform-object-rest-spread'],
                }
            },
            {
                test: /\.css$/,
                use: [
                    'style-loader',
                    'css-loader',
                ],
            },
            {
                test: /\.scss$/,
                use: [
                    'style-loader',
                    'css-loader',
                    'sass-loader',
                ],
            },
        ]
    },
    resolve: {
        extensions: ['.js', '.jsx'],
        modules: [path.resolve(__dirname, 'assets'), NODE_MODULES],
    },
    resolveLoader: {
        modules: [NODE_MODULES],
    },
    plugins: [
        new ManifestPlugin(),
        new webpack.ProvidePlugin({
            $: 'jquery',
            jQuery: 'jquery',
            Popper: ['popper.js', 'default'],
        })
    ]
};
