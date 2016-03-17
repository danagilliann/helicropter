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
      },
      initialImage: {
        src: '/imgs/test-kitten.jpeg',
        url: 'https://foo.com/imgs/test-kitten.jpeg'
      }
    };

    this._create = customConfig => {
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
        this.helicropter = this._create();
      });

      it('returns undefined', function() {
        spyOn(this.helicropter._view._croppingArea, 'getCropData').and.returnValue(undefined);
        expect(this.helicropter.crop()).not.toBeDefined();
      });
    });
  });

  describe('when given an initial image', function() {
    beforeEach(function() {
      this.helicropter = this._create();
    });

    it('does not show the upload state for the cropper', function() {
      expect($('.js-upload-container .js-upload-button')).not.toBeVisible();
    });
  });

  describe('when given preview crop configuration', function() {
    beforeEach(function() {
      this.helicropter = this._create({
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
      this.helicropter = this._create();
      this.helicropter.removeImage();
    });

    it('shows the upload button on the cropper', function() {
      expect($('.js-upload-container .js-upload-button')).toBeVisible();
    });
  });
});
