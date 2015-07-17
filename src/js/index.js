import Controller from 'BeFF/Controller';
import View from 'BeFF/View';

import CroppingArea from './CroppingArea';
import ZoomSlider from './ZoomSlider';
//import RatioLock from './RatioLock';
//import SuggestionArea from './SuggestionArea';

import template from '../templates/wrapper.mustache';

const HelicropterView = View.extend({
  rendered() {
    this._croppingArea = new CroppingArea({
      cropWidth: this._model.get('cropSize').width,
      cropHeight: this._model.get('cropSize').height
    });
    this._croppingArea.render(this.$view.find('.js-image-container'));

    console.log(this._model.get('cropSize').width);

    this._zoomSlider = new ZoomSlider({
      cropWidth: this._model.get('cropSize').width,
      cropHeight: this._model.get('cropSize').height
    });
    this._zoomSlider.render(this.$view.find('.js-crop-controls'));

    this._croppingArea.relay(this._zoomSlider, 'scale');
    this._zoomSlider.relay(this._croppingArea, 'image-loaded');
  },

  mustache: template
});

const Helicropter = Controller.extend({
}, {
  VIEW_CLASS: HelicropterView
});

export default Helicropter;
