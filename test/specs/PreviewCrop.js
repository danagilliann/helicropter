import $ from 'jquery';
import { proportion, default as PreviewCrop } from 'PreviewCrop';
import images from '../fixtures/images';

function createPreviewCrop($el) {
  const previewCrop = new PreviewCrop();
  previewCrop.render($el);
  return previewCrop;
}

describe('PreviewCrop', function() {
  beforeEach(function(done) {
    setStyleFixtures('.hide { display: none; }');

    this.$el = affix('.js-preview-crop-parent');
    this.previewCrop = createPreviewCrop(this.$el);
    this.$canvas = this.$el.find('.js-preview-crop-canvas');

    this.imageData = {
      image: images.flower,
      scale: 1,
      top: 0,
      left: 0,
      cropWidth: 320,
      cropHeight: 250
    };

    this.previewCrop.renderImage(this.imageData).then(done);
  });

  afterEach(function() {
    this.previewCrop.destroy();
  });

  it('renders', function() {
    expect(this.$canvas).toExist();
  });

  it('does not throw if scaling happens before the image is loaded', function() {
    const previewCrop = createPreviewCrop(this.$el);
    expect(() => {
      previewCrop.trigger('scaling', {
        scale: 1,
        left: 10,
        top: 10
      });
    }).not.toThrow();
    previewCrop.destroy();
  });

  describe('when given an image', function() {
    it('renders a scaled down version', function() {
      expect(this.$canvas).toHaveCss({
        width: this.imageData.cropWidth * proportion + 'px',
        height: this.imageData.cropHeight * proportion + 'px'
      });
    });
  });

  describe('when notified of movement from the main image', function() {
    it('updates the scaled position of the preview', function() {
      const oldLeft = parseInt(this.previewCrop._$image.css('left'), 10);
      const oldTop = parseInt(this.previewCrop._$image.css('top'), 10);

      this.previewCrop.trigger('moving', {
        left: 100,
        top: 100
      });

      const newLeft = parseInt(this.previewCrop._$image.css('left'), 10);
      const newTop = parseInt(this.previewCrop._$image.css('top'), 10);

      expect(newTop).not.toBe(oldTop);
      expect(newTop).toBeLessThan(100);

      expect(newLeft).not.toBe(oldLeft);
      expect(newLeft).toBeLessThan(100);
    });
  });

  describe('when the main image scales', function() {
    beforeEach(function() {
      this.scaleData = {
        scale: 0.75,
        left: 100,
        top: 100
      };
    });

    it('also scales the preview', function() {
      const oldWidth = this.previewCrop._$image.width();

      this.previewCrop.trigger('scaling', this.scaleData);

      const newWidth = Math.round(this.previewCrop._$image.width());
      const expectedWidth = Math.round(oldWidth * this.scaleData.scale);
      expect(newWidth).toBe(expectedWidth);
    });

    it('adjusts the position of the preview image accordingly', function() {
      const oldLeft = parseInt(this.previewCrop._$image.css('left'), 10);
      const oldTop = parseInt(this.previewCrop._$image.css('top'), 10);

      this.previewCrop.trigger('scaling', this.scaleData);

      const newLeft = parseInt(this.previewCrop._$image.css('left'), 10);
      const newTop = parseInt(this.previewCrop._$image.css('top'), 10);

      expect(newTop).not.toBe(oldTop);
      expect(newTop).toBeLessThan(this.scaleData.top);

      expect(newLeft).not.toBe(oldLeft);
      expect(newLeft).toBeLessThan(this.scaleData.left);
    });
  });

  describe('when the main image is removed', function() {
    beforeEach(function() {
      this.previewCrop.trigger('remove-image');
    });

    it('shows an upload button', function() {
      expect($('.js-upload-button')).toBeVisible();
    });

    it('hides the canvas', function() {
      expect($('.js-preview-crop-canvas')).not.toBeVisible();
    });

    describe('and the user clicks on the upload button', function() {
      it('requests that an image is uploaded', function(done) {
        this.previewCrop.on('upload-image', done);
        $('.js-upload-button').click();
      });
    });
  });
});
