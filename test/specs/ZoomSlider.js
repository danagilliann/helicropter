import ZoomSlider from 'ZoomSlider';

describe('ZoomSlider', function() {
  beforeEach(function() {
    this.$el = affix('.js-zoom-slider-parent');
    this.zoomSlider = new ZoomSlider();
    this.zoomSlider.render(this.$el);
  });

  afterEach(function() {
    this.zoomSlider.destroy();
  });

  it('renders', function() {
    expect(this.$el.find('.js-scale-slider')).toExist();
  });

  describe('#rendered', function() {
    it('creates slider input binding', function(done) {
      this.zoomSlider.on('scale', done);
      this.zoomSlider.$view.find('.js-scale-slider').val(50).trigger('input');
    });
  });

  describe('#reset', function() {
    beforeEach(function() {
      this.zoomSlider.$view.find('.js-scale-slider').val(50);
    });

    it('sets the slider value to 0', function() {
      expect(+this.zoomSlider.$view.find('.js-scale-slider').val()).not.toBe(0);
      this.zoomSlider.reset();
      expect(+this.zoomSlider.$view.find('.js-scale-slider').val()).toBe(0);
    });

    it('triggers change on the input', function(done) {
      this.zoomSlider.$view.find('.js-scale-slider').on('change', done);
      this.zoomSlider.reset();
    });
  });

  describe('#disable', function() {
    it('adds a disabled class to the slider container', function() {
      this.zoomSlider.disable();
      expect(this.zoomSlider.$view).toHaveClass('disabled');
    });

    it('disables the slider input', function() {
      this.zoomSlider.disable();
      expect(this.zoomSlider.$view.find('.js-scale-slider')).toBeDisabled();
    });
  });

  describe('#enable', function() {
    beforeEach(function() {
      this.zoomSlider.disable();
    });

    it('adds a disabled class to the slider container', function() {
      this.zoomSlider.enable();
      expect(this.zoomSlider.$view).not.toHaveClass('disabled');
    });

    it('disables the slider input', function() {
      this.zoomSlider.enable();
      expect(this.zoomSlider.$view.find('.js-scale-slider')).not.toBeDisabled();
    });
  });

  describe('events', function() {
    describe('#image-loaded', function() {
      describe('when only triggered with a minScale', function() {
        beforeEach(function() {
          this.zoomSlider.trigger('image-loaded', { minScale: 0.0 });
        });

        it('re-calculates the scaleStep', function() {
          expect(this.zoomSlider._scaleStep).toBe(0.01);
        });
      });

      describe('when triggered with a minScale and a current scale', function() {
        beforeEach(function() {
          this.zoomSlider.trigger('image-loaded', { scale: 0.5, minScale: 0.0 });
        });

        it('re-calculates the scaleStep', function() {
          expect(this.zoomSlider._scaleStep).toBe(0.01);
        });

        it('sets the input to the value for the current scale', function() {
          expect(+this.zoomSlider.$view.find('.js-scale-slider').val()).toBe(50);
        });
      });
    });

    describe('#set-crop-size', function() {
      beforeEach(function() {
        this.zoomSlider.trigger('image-loaded', { scale: 0.5, minScale: 0.0 });
      });

      it('re-calculates the scaleStep', function() {
        this.zoomSlider.trigger('set-crop-size', { minScale: 0.5 });
        expect(this.zoomSlider._scaleStep).toBe(0.005);
      });

      it('sets the input to the value for the current scale', function() {
        this.zoomSlider.trigger('set-crop-size', { minScale: 0.5 });
        expect(+this.zoomSlider.$view.find('.js-scale-slider').val()).toBe(0);
      });

      it('triggers scale with the current scale', function(done) {
        this.zoomSlider.on('scale', (scale) => {
          expect(scale).toBe(0.5);
          done();
        });

        this.zoomSlider.trigger('set-crop-size', { minScale: 0.5 });
      });
    });
  });
});
