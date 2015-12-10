/* jshint node: true */
// Karma configuration
// Generated on Fri May 16 2014 10:44:21 GMT-0400 (EDT)

var webpack = require('webpack');
var webpackConfig = require('./webpack.config.js');
delete webpackConfig.entry;
delete webpackConfig.output;

// Only run coverage report during `npm test`
if (process.env.npm_lifecycle_event === 'test') {
  webpackConfig.module.postLoaders = webpackConfig.module.postLoaders || [];
  webpackConfig.module.postLoaders.push({
    test: /\.js$/,
    exclude: /(test|node_modules)\//,
    loader: 'istanbul-instrumenter'
  });
}

module.exports = function(config) {
  config.set({
    basePath: '',

    frameworks: ['jasmine'],

    files: [
      'test/lib/polyfills.js',
      './node_modules/jquery/dist/jquery.js',
      './node_modules/jasmine-jquery/lib/jasmine-jquery.js',
      './node_modules/jasmine-fixture/dist/jasmine-fixture.js',
      'test/specs/**/*.js'
    ],

    proxies: {
      '/img/': 'http://localhost:9876/base/public/img/'
    },

    preprocessors: {
      'test/specs/**/*.js': ['webpack']
    },

    coverageReporter: {
      reporters: [
        {
          type: 'text-summary'
        },
        {
          type: 'html',
          dir: 'coverage/'
        }
      ]
    },

    reporters: ['progress', 'coverage'],

    webpack: webpackConfig,

    webpackMiddleware: {
      noInfo: true
    },

    mochaReporter: {
      ignoreSkipped: true
    },

    port: 9876,

    colors: true,

    logLevel: config.LOG_INFO,

    autoWatch: true,

    browsers: ['PhantomJS'],

    singleRun: false
  });
};
