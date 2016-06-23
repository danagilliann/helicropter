import View from 'beff/View';

import template from 'hgn!../templates/zoom-slider';

const MAX_SCALE = 1.0;
const TOTAL_STEPS = 100;

export default View.extend({
  mustache: template,

  rendered() {
    this._$slider = this.$view.find('.js-scale-slider');
    this._$slider.on('input', () => this.trigger('scale', this._currentScale()));

    this.on({
      'image-loaded'({ scale, minScale }) {
        this._scaleMin = minScale;
        this._calculateScaleStep(scale);
      },

      'set-crop-size'({ minScale }) {
        const previousScale = this._currentScale();

        this._scaleMin = minScale;
        this._calculateScaleStep(previousScale);
        this.trigger('scale', this._currentScale());
      }
    });
  },

  reset() {
    this._$slider.val(0).trigger('change');
  },

  disable() {
    this.$view.addClass('disabled');
    this._$slider.prop('disabled', true);
  },

  enable() {
    this.$view.removeClass('disabled');
    this._$slider.prop('disabled', false);
  },

  _calculateScaleStep(initialScale = 0) {
    const initialValue = Math.max(initialScale - this._scaleMin, 0);

    this._scaleStep = (MAX_SCALE - this._scaleMin) / TOTAL_STEPS;
    this._$slider.val(Math.round(initialValue / this._scaleStep)).trigger('change');
  },

  _currentScale() {
    if (!this._scaleStep) { return; }

    const value = this._$slider.val();

    if (value === TOTAL_STEPS) {
      return MAX_SCALE;
    }

    return this._scaleMin + (value * this._scaleStep);
  }
});
