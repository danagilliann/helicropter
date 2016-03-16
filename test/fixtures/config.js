export default {
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
  displayedWidth: 500,
  previewCrop: {
    element: $('.js-preview-crop-container')
  },
  cropRatio: {
    width: 4,
    height: 3
  },
  viewportRatio: 'static',
  allowTransparency: false,
  //uploadTitle: 'Upload a new cover image',
  //uploadSubtitle: 'This will not affect your Behance cover image',
  initialImage: {
    src: '/imgs/test-kitten.jpeg',
    url: 'https://foo.com/imgs/test-kitten.jpeg',
    coordinates: {
      x: 0,
      y: 0,
      //height: 836,
      //width: 1113
      scale: 0.25
    }
  },
  //previewMode: true,
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
};
