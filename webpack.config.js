/* jshint node: true */
var path = require('path');
var webpack = require("webpack");

var commonLoaders = [
  { test: /(\.js)$/, exclude: /node_modules/, loader: 'babel-loader' },
  { test: /(\.mustache)$/, exclude: /node_modules/, loader: 'mustache' }
];

var assetsPath = path.join(__dirname, 'dist', 'js');

module.exports = [{
  // The configuration for the client
  name: 'browser',
  debug: true,
  entry: './src/js/index.js',
  output: {
    path: assetsPath,
    libraryTarget: 'umd',
    filename: 'helicropter.js'
  },
  resolve: {
    root: [path.join(__dirname, "bower_components")],
    modulesDirectories: ['node_modules']
  },
  externals: [
    'jquery',
    'BeFF/Controller',
    'BeFF/Component',
    'BeFF/View',
    'nbd/util/extend'
  ],
  module: {
    loaders: commonLoaders
  },
  devtool: 'inline-source-map',
  plugins: [
    new webpack.ResolverPlugin(
      new webpack.ResolverPlugin.DirectoryDescriptionFilePlugin("bower.json", ["main"])
    )
  ]
}];
