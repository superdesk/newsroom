const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const ManifestPlugin = require('webpack-manifest-plugin');

module.exports = {
    entry: {
        newsroom_js: './assets/index.js',
        newsroom_css: './assets/style.js',
        users_js: './assets/users.js',
        companies_js: './assets/companies.js',
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
        modules: [path.resolve(__dirname, 'assets'), 'node_modules'],
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
