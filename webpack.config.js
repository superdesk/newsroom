/* eslint-env node */

const path = require('path');
const webpack = require('webpack');
const ManifestPlugin = require('webpack-manifest-plugin');
const NODE_MODULES = process.env.NODE_MODULES || 'node_modules';

module.exports = {
    entry: {
        newsroom_js: './assets/index.js',
        companies_js: './assets/companies/index.js',
        users_js: './assets/users/index.js',
        products_js: './assets/products/index.js',
        'section-filters_js': './assets/section-filters/index.js',
        navigations_js: './assets/navigations/index.js',
        cards_js: './assets/cards/index.js',
        user_profile_js: './assets/user-profile/index.js',
        newsroom_css: './assets/style.js',
        wire_js: './assets/wire/index.js',
        home_js: './assets/home/index.js',
        agenda_js: './assets/agenda/index.js',
        notifications_js: './assets/notifications/index.js',
        company_reports_js: './assets/company-reports/index.js',
        print_reports_js: './assets/company-reports/components/index.js',
        am_news_js: './assets/am-news/index.js',
        am_news_css: './assets/am-news/style.js',
        'general-settings_js': './assets/general-settings/index.js',
        market_place_js: './assets/market-place/index.js',
        media_releases_js: './assets/media-releases/index.js',
        monitoring_js: './assets/monitoring/index.js',
        common: [
            'alertifyjs',
            'bootstrap',
            'classnames',
            'lodash',
            'moment',
            'prop-types',
            'react',
            'react-dom',
            'react-redux',
            'redux',
            'redux-thunk',
            'redux-logger',
        ],
    },
    output: {
        path: path.resolve(__dirname, 'newsroom', 'static', 'dist'),
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
            // bootstrap depenendecies
            'window.jQuery': 'jquery',
            'window.Popper': 'popper.js',
        }),
        new webpack.optimize.CommonsChunkPlugin({
            name: 'common',
            minChunks: Infinity,
        }),
    ]
};
