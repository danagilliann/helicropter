import View from 'beff/View';

import template from 'hgn!../templates/zoom-slider';

export default View.extend({
  mustache: template,

  init({ cropWidth, cropHeight, allowTransparency, initialScale }) {
    this._cropWidth = cropWidth;
    this._cropHeight = cropHeight;
    this._initialScale = initialScale || 1.0;
    this._lowerBoundFn = allowTransparency ? Math.min : Math.max;

    this._super();

    this.on('image-loaded', (imageDimensions) => this._calculateScaleAttrs(imageDimensions));
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

  _calculateScaleAttrs(imageDimensions) {
    const widthScaleMin = this._cropWidth / imageDimensions.width;
    const heightScaleMin = this._cropHeight / imageDimensions.height;

    this._scaleMin = this._lowerBoundFn(widthScaleMin, heightScaleMin);
    this._scaleStep = (1.0 - this._scaleMin) / 100;

    if (this._initialScale) {
      const initialValue = Math.max(this._initialScale - this._scaleMin, 0);

      this._$slider.val(Math.round(initialValue / this._scaleStep)).trigger('change');
      delete this._initialScale;
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
