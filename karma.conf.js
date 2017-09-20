var webpackConfig = require('./webpack.config.js');

module.exports = function(config) {
    config.set({
        frameworks: ['jasmine'],

        files: [
            {pattern: 'assets/**/*spec.js', watched: false},
        ],

        preprocessors: {
            'assets/**/*spec.js': ['webpack', 'sourcemap'],
        },

        webpack: {
            module: webpackConfig.module,
            resolve: webpackConfig.resolve,
            devtool: 'inline-source-map',
        },

        webpackMiddleware: {
            stats: 'errors-only'
        },

        browsers: ['ChromeHeadless'],
    });
};
