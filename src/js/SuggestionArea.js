import $ from 'jquery';
import View from 'beff/View';

import template from '../templates/suggesstion-area.mustache';

export default View.extend({
  _maxSuggestions: 7,

  mustache: template,

  init(model) {
    this._super(this._padOrTruncateSuggestions(model));

    this._$activeElement = null;
  },

  events: {
    click: {
      '.js-upload-btn': ':upload-image',
      '.js-suggestion-item': '_setImage'
    }
  },

  reset() {
    if (!this._$activeElement) { return; }

    this._$activeElement.removeClass('active');
    this._$activeElement = null;
  },

  _padOrTruncateSuggestions(model) {
    model.suggestions = model.suggestions || [];

    if (model.suggestions.length < this._maxSuggestions) {
      while (model.suggestions.length < this._maxSuggestions) {
        model.suggestions.push({ src: '', empty: true });
      }
    }
    else {
      model.suggestions = model.suggestions.slice(0, 7);
    }

    return model;
  },

  _setImage({ currentTarget: target }) {
    if (!target.dataset.src) { return; }

    if (this._$activeElement) {
      this.reset();
    }

    this._$activeElement = $(target);
    this._$activeElement.addClass('active');

    this.trigger('set-image', target.dataset.src);
  }
});
