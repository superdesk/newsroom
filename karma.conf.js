
const webpack = require('webpack');
const webpackConfig = require('./webpack.config.js');

module.exports = function(config) {
    config.set({
        frameworks: ['jasmine'],

        files: [
            {pattern: 'assets/**/*spec.js', watched: false},
        ],

        preprocessors: {
            'assets/**/*.js': ['webpack', 'sourcemap'],
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

        browsers: ['ChromeHeadless'],
    });
};
