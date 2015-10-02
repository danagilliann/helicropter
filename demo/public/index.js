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
        endpoint: 'foo',
        accessKey: 'foo'
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
    viewportRatio: 'static',
    allowTransparency: false,
    //uploadTitle: 'Upload a new cover image',
    //uploadSubtitle: 'This will not affect your Behance cover image',
    //initialImage: { src: '/imgs/test-kitten.jpeg', url: 'https://foo.com/imgs/test-kitten.jpeg' },
    uploadBackgroundImage: '/imgs/test-kitten.jpeg',
    showRatioLock: true,
    showSuggestions: true,
    suggestions: [
      { src: '/imgs/test-kitten.jpeg', url: 'https://foo.com/imgs/test-kitten.jpeg', active: true },
      { src: '/imgs/test-image-0.png', url: 'https://foo.com/imgs/test-image-0.png' },
      { src: '/imgs/test-image-1.png', url: 'https://foo.com/imgs/test-image-1.png' },
      { src: '/imgs/test-image-2.png', url: 'https://foo.com/imgs/test-image-2.png' },
      { src: '/imgs/test-image-3.png', url: 'https://foo.com/imgs/test-image-3.png' }
    ]
  });
  cropper.render($('.js-cropper'));

  cropper.on('error:upload', function(err) {
    console.error('Error:', err.message);
  });
  window.cropper = cropper;
});
