import View from 'BeFF/View';

import template from '../templates/suggesstion-area.mustache';

export default View.extend({
  _maxSuggestions: 7,

  mustache: template,

  init(model) {
    this._super(this._padOrTruncateSuggestions(model));
  },

  events: {
    click: {
      '.js-upload-btn': ':upload-image',
      '.js-suggestion-item': '_setImage'
    }
  },

  _padOrTruncateSuggestions(model) {
    model.suggestions = model.suggestions || [];

    if (model.suggestions.length < this._maxSuggestions) {
      while (model.suggestions.length < this._maxSuggestions) {
        model.suggestions.push({ src: '' });
      }
    }
    else {
      model.suggestions = model.suggestions.slice(0, 7);
    }

    return model;
  },

  _setImage({ currentTarget: target }) {
    if (!target.dataset.src) { return; }

    this.trigger('set-image', target.dataset.src);
  }
});
