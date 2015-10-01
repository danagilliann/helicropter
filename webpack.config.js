/* jshint node: true */
var path = require('path');
var webpack = require('webpack');
var Notifier = require('webpack-notifier');

var commonLoaders = [
  { test: /(\.js)$/, exclude: /node_modules/, loader: 'babel-loader' },
  { test: /(\.mustache)$/, exclude: /node_modules/, loader: 'mustache' },
  { test: /\.(png|jpg|gif)$/, loader: 'url?limit=25000' }
];

var assetsPath = path.join(__dirname, 'dist', 'js');

module.exports = [{
  // The configuration for the client
  name: 'browser',
  entry: './src/js/index.js',
  output: {
    path: assetsPath,
    libraryTarget: 'umd',
    filename: 'helicropter.js'
  },
  resolve: {
    modulesDirectories: ['node_modules']
  },
  externals: [
    'jquery',
    'beff/Controller',
    'beff/Component',
    'beff/View',
    'beff/Component/CloudUploader',
    'nbd/util/extend'
  ],
  module: {
    loaders: commonLoaders
  },
  devtool: 'inline-source-map',
  plugins: [
    new Notifier({ title: 'Helicropter' })
  ]
}];
