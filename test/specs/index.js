import $ from 'jquery';
import extend from 'nbd/util/extend';
import Helicropter from 'index';

describe('Helicropter', function() {
  beforeEach(function() {
    setFixtures('<div class="helicropter-container"></div>');

    setStyleFixtures('.hide { display: none; }');

    $('#jasmine-fixtures').append('<div class="preview-crop-container"></div>');

    this.defaultConfig = {
      uploaderOptions: {
        request: {
          endpoint: 'foo',
          accessKey: 'foo'
        },
        signature: {
          endpoint: '/s3handler'
        }
      }
    };

    this._createWithInitialImage = customConfig => {
      const initialImage = {
        initialImage: {
          src: '/imgs/test-kitten.jpeg',
          url: 'https://foo.com/imgs/test-kitten.jpeg'
        }
      };
      const inst = new Helicropter(extend(this.defaultConfig, initialImage, customConfig));
      inst.render($('.helicropter-container'));
      return inst;
    };

    this._createWithoutInitialImage = customConfig => {
      const inst = new Helicropter(extend(this.defaultConfig, customConfig));
      inst.render($('.helicropter-container'));
      return inst;
    };
  });

  afterEach(function() {
    this.helicropter.destroy();
  });

  describe('#crop', function() {
    describe('when cropping area does not have crop data', function() {
      beforeEach(function() {
        this.helicropter = this._createWithInitialImage();
      });

      it('returns undefined', function() {
        spyOn(this.helicropter._view._croppingArea, 'getCropData').and.returnValue(undefined);
        expect(this.helicropter.crop()).not.toBeDefined();
      });
    });
  });

  describe('when given an initial image', function() {
    beforeEach(function() {
      this.helicropter = this._createWithInitialImage();
    });

    it('does not show the upload state for the cropper', function() {
      expect($('.js-upload-container .js-upload-button')).not.toBeVisible();
    });

    it('shows the loading state for the cropper', function() {
      expect($('.js-image-upload-wrapper .helicropter-spinner')).toBeVisible();
    });
  });

  describe('when not given an initial image', function() {
    beforeEach(function() {
      this.helicropter = this._createWithoutInitialImage();
    });

    it('shows the upload state for the cropper', function() {
      expect($('.js-upload-container .js-upload-button')).toBeVisible();
    });

    it('does not show the loading state for the cropper', function() {
      expect($('.js-image-upload-wrapper .helicropter-spinner')).not.toBeVisible();
    });
  });

  describe('when given preview crop configuration', function() {
    beforeEach(function() {
      this.helicropter = this._createWithInitialImage({
        previewCrop: {
          element: $('.preview-crop-container')
        }
      });
    });

    it('renders a preview of the rendered image', function() {
      expect($('.js-preview-crop-canvas')).toExist();
    });
  });

  describe('when a user removes the initial image', function() {
    beforeEach(function() {
      this.helicropter = this._createWithInitialImage();
      this.helicropter.removeImage();
    });

    it('shows the upload button on the cropper', function() {
      expect($('.js-upload-container .js-upload-button')).toBeVisible();
    });
  });
});
