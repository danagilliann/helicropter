require.config({
  paths: {
    helicropter: '/dist/js/helicropter',
    jquery: '/vendor/jquery/dist/jquery',
    beff: '/vendor/beff',
    nbd: '/vendor/beff/bower_components/nbd',
    fineuploader: '/vendor/beff/bower_components/fineuploader/dist'
  }
});

define([
  'jquery',
  'helicropter'
], function($, Helicropter) {
  'use strict';

  var cropper = new Helicropter({
    uploaderOptions: {
      request: {
        endpoint: '',
        accessKey: ''
      },
      signature: {
        endpoint: '/s3handler'
      }
    },
    canvasSize: {
      width: 432,
      height: 300
    },
    cropSize: {
      width: 320,
      height: 250
    },
    //uploadTitle: 'Upload a new cover image',
    //uploadSubtitle: 'This will not affect your Behance cover image',
    //initialImage: '/imgs/test-kitten.jpeg',
    showRatioLock: true,
    showSuggestions: true,
    suggestions: [
      { src: '/imgs/test-kitten.jpeg' },
      { src: '/imgs/test-image-0.png' },
      { src: '/imgs/test-image-1.png' },
      { src: '/imgs/test-image-2.png' },
      { src: '/imgs/test-image-3.png' }
    ]
  });
  cropper.render($('.js-cropper'));

  window.cropper = cropper;
});
