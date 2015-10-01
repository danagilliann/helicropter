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
    alias: {
      fineuploader: 'fine-uploader/dist'
    },
    modulesDirectories: ['node_modules']
  },
  module: {
    loaders: commonLoaders
  },
  devtool: 'inline-source-map',
  plugins: [
    new Notifier({ title: 'Helicropter' })
  ]
}];
