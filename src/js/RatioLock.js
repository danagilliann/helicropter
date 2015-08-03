import extend from 'nbd/util/extend';
import View from 'BeFF/View';

import template from '../templates/ratio-lock.mustache';

export default View.extend({
  mustache: template,

  events: {
    change: {
      '.js-ratio-lock': '_toggleRatioLock'
    }
  },

  rendered() {
    this._$ratioCheckbox = this.$view.find('.js-ratio-lock');
  },

  templateData() {
    return extend({
      checked: true,
      labelText: 'Enable aspect ratio for cover image resize'
    });
  },

  _toggleRatioLock() {
    this.trigger('ratio-locked', this._$ratioCheckbox.prop('checked'));
  }
});
