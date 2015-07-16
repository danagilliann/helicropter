require.config({
  paths: {
    helicropter: '../dist/js/helicropter',
    jquery: '../node_modules/jquery/dist/jquery',
    BeFF: '../node_modules/BeFF',
    nbd: '../node_modules/BeFF/bower_components/nbd'
  }
});

define([
  'jquery',
  'helicropter'
], function($, Helicropter) {
  'use strict';

  var cropper = new Helicropter({});
  cropper.render($('.js-cropper'));
});
