const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const ManifestPlugin = require('webpack-manifest-plugin');

module.exports = {
    entry: {
        newsroom_js: './assets/index.js',
        users_js: './assets/users.js',
        companies_js: './assets/companies.js',
        newsroom_css: './assets/index.scss',
        wire_js: ['babel-polyfill', './assets/wire/index.js'],
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        publicPath: 'http://localhost:8080/assets/',
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
                use: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: 'css-loader',
                })
            },
            {
                test: /\.scss$/,
                use: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: ['css-loader', 'sass-loader'],
                })
            },
        ]
    },
    resolve: {
        extensions: ['.js', '.jsx'],
        modules: [path.resolve(__dirname, 'assets'), 'node_modules'],
    },
    plugins: [
        new ExtractTextPlugin('[name].[chunkhash].css'),
        new ManifestPlugin(path.resolve(__dirname, 'manifest.json')),
        new webpack.ProvidePlugin({
            $: "jquery",
            jQuery: "jquery"
        })
    ],
    devtool: 'eval'
};
