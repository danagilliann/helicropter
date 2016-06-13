/* jshint node: true */
var path = require('path');
var Notifier = require('webpack-notifier');
var hgn = require('hgn-loader');
hgn.prefix = 'src/templates/';

var commonLoaders = [
  {
    test: /(\.js)$/,
    exclude: /node_modules/,
    loader: 'babel'
  },
  { test: /\.(png|jpg|gif)$/, loader: 'url?limit=25000' }
];

var assetsPath = path.join(__dirname, 'dist', 'js');

module.exports = {
  name: 'browser',
  entry: './src/js/index.js',
  output: {
    path: assetsPath,
    libraryTarget: 'umd',
    filename: 'helicropter.js'
  },
  resolve: {
    root: path.join(__dirname, 'src', 'js'),
    alias: {
      templates: __dirname + '/src/templates',
      fineuploader: 'fine-uploader/dist'
    },
    extensions: ['', '.js', '.mustache', '.css', '.scss'],
    modulesDirectories: ['node_modules']
  },
  module: {
    loaders: commonLoaders
  },
  devtool: 'inline-source-map',
  plugins: [
    new Notifier({ title: 'Helicropter' })
  ]
};
