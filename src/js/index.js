import Controller from 'BeFF/Controller';
import View from 'BeFF/View';

import CroppingArea from './CroppingArea';
//import ZoomSlider from './ZoomSlider';
//import RatioLock from './RatioLock';
//import SuggestionArea from './SuggestionArea';

import template from '../templates/wrapper.mustache';

const HelicropterView = View.extend({
  rendered() {
    this._croppingArea = new CroppingArea();
    this._croppingArea.render(this.$view.find('.js-image-container'));
  },

  mustache: template
});

const Helicropter = Controller.extend({
}, {
  VIEW_CLASS: HelicropterView
});

export default Helicropter;
