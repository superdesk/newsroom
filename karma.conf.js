var webpackConfig = require('./webpack.config.js');

module.exports = function(config) {
    config.set({
        frameworks: ['jasmine'],

        files: [
            {pattern: 'assets/**/*spec.js', watched: false},
        ],

        preprocessors: {
            'assets/**/*spec.js': ['webpack'],
        },

        webpack: {
            module: webpackConfig.module,
        },

        webpackMiddleware: {
            stats: 'errors-only'
        },

        browsers: ['ChromeHeadless'],
        singleRun: true,
    });
};
