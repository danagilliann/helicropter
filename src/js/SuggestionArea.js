import $ from 'jquery';
import View from 'beff/View';

import template from 'hgn!../templates/suggesstion-area';

export default View.extend({
  _maxSuggestions: 7,

  mustache: template,

  init(model) {
    this._$activeElement = null;
    this._super(this._padOrTruncateSuggestions(model));

    this.on({
      ['image-uploaded']({ src, url }) {
        const firstSuggestion = this._model.suggestions[0];
        const newSuggestion = {
          src,
          url,
          cover: true,
          active: true
        };

        this._model.suggestions = [newSuggestion].concat(this._model.suggestions);
        this._model = this._padOrTruncateSuggestions(this._model);

        this.render();
      }
    })
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
      model.suggestions = model.suggestions.slice(0, this._maxSuggestions);
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

    this.trigger('set-image', { src: target.dataset.src, url: target.dataset.url });
  }
});
