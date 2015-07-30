import View from 'BeFF/View';

import template from '../templates/suggesstion-area.mustache';

export default View.extend({
  mustache: template,

  events: {
    click: {
      '.js-upload-btn': ':upload-image',
      '.js-suggestion-item': '_setImage'
    }
  },

  _setImage({ currentTarget: target }) {
    this.trigger('set-image', target.dataset.src);
  }
});
