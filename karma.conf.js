/* eslint-env node */

const webpack = require('webpack');
const webpackConfig = require('./webpack.config.js');

module.exports = function(config) {
    config.set({
        files: [
            'assets/tests.js',
        ],

        preprocessors: {
            'assets/tests.js': ['webpack', 'sourcemap'],
        },


        webpack: {
            module: webpackConfig.module,
            resolve: webpackConfig.resolve,
            plugins: webpackConfig.plugins.filter((plugin) => plugin instanceof webpack.ProvidePlugin),
            devtool: 'inline-source-map',
        },

        webpackMiddleware: {
            stats: 'errors-only'
        },

        reporters: ['dots'],
        frameworks: ['jasmine'],
        browsers: ['ChromeHeadless'],
    });
};
