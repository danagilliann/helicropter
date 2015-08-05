import View from 'BeFF/View';

import template from '../templates/zoom-slider.mustache';

export default View.extend({
  mustache: template,

  init({ cropWidth, cropHeight }) {
    this._cropWidth = cropWidth;
    this._cropHeight = cropHeight;

    this._super();

    this.on('image-loaded', (imageDimensions) => this._calculateScaleAttrs(imageDimensions));
  },

  rendered() {
    this._$slider = this.$view.find('.js-scale-slider');

    this._$slider.on('input', () => this.trigger('scale', this._currentScale()));
  },

  reset() {
    this._$slider.val(100);
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

    this._scaleMin = Math.min(widthScaleMin, heightScaleMin);
    this._scaleStep = (1.0 - this._scaleMin) / 100;
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
