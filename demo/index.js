require.config({
  paths: {
    helicropter: '../dist/js/helicropter',
    jquery: '../node_modules/jquery/dist/jquery',
    BeFF: '../node_modules/BeFF',
    nbd: '../node_modules/BeFF/bower_components/nbd',
    fineuploader: '../node_modules/BeFF/bower_components/fineuploader/dist'
  }
});

define([
  'jquery',
  'helicropter'
], function($, Helicropter) {
  'use strict';

  var cropper = new Helicropter({
    canvasSize: {
      width: 432,
      height: 300
    },
    cropSize: {
      width: 320,
      height: 250
    },
    showSuggestions: true,
    suggestions: [
      { src: '/demo/imgs/test-kitten.jpeg' },
      { src: '/demo/imgs/test-image-0.png' },
      { src: '/demo/imgs/test-image-1.png' },
      { src: '/demo/imgs/test-image-2.png' },
      { src: '/demo/imgs/test-image-3.png' }
    ]
  });
  cropper.render($('.js-cropper'));
});
