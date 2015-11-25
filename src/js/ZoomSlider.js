import View from 'beff/View';

import template from 'hgn!../templates/zoom-slider';

const INITIAL_SCALE = 1.0;

export default View.extend({
  mustache: template,

  init({ allowTransparency }) {
    this._lowerBoundFn = allowTransparency ? Math.min : Math.max;

    this._super();

    this.on({
      'image-loaded'({ width, height, scale, cropWidth, cropHeight }) {
        this._width = width || this._width;
        this._height = height || this._height;
        this._cropWidth = cropWidth || this._cropWidth;
        this._cropHeight = cropHeight || this._cropHeight;

        this._calculateScaleAttrs(scale);
      },

      'set-crop-size'({ width, height }) {
        this._cropWidth = width;
        this._cropHeight = height;

        if (this._width && this._height) {
          const previousScale = this._currentScale();
          this._calculateScaleAttrs(previousScale);
          this.trigger('scale', this._currentScale());
        }
      }
    });
  },

  rendered() {
    this._$slider = this.$view.find('.js-scale-slider');
    this._$slider.on('input', () => this.trigger('scale', this._currentScale()));
  },

  reset() {
    this._$slider.val(100).trigger('change');
  },

  disable() {
    this.$view.addClass('disabled');
    this._$slider.prop('disabled', true);
  },

  enable() {
    this.$view.removeClass('disabled');
    this._$slider.prop('disabled', false);
  },

  _calculateScaleAttrs(initialScale) {
    const widthScaleMin = this._cropWidth / this._width;
    const heightScaleMin = this._cropHeight / this._height;

    this._scaleMin = this._lowerBoundFn(widthScaleMin, heightScaleMin);
    this._scaleStep = (1.0 - this._scaleMin) / 100;

    if (initialScale) {
      const initialValue = Math.max(initialScale - this._scaleMin, 0);
      this._$slider.val(Math.round(initialValue / this._scaleStep)).trigger('change');
    }
  },

  _currentScale() {
    if (!this._scaleMin || !this._scaleStep) { return; }

    const value = this._$slider.val();

    if (value === 100) {
      return 1.0;
    }

    return this._scaleMin + (value * this._scaleStep);
  }
});
