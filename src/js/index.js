import Controller from 'BeFF/Controller';
import View from 'BeFF/View';

// import UploadArea from './UploadArea';
import CroppingArea from './CroppingArea';
import ZoomSlider from './ZoomSlider';
// import RatioLock from './RatioLock';
import SuggestionArea from './SuggestionArea';

import template from '../templates/wrapper.mustache';

const HelicropterView = View.extend({
  rendered() {
    // this._uploadArea = new UploadArea({
    //   request: {
    //     endpoint: '',
    //     accessKey: ''
    //   },
    //   signature: {
    //     endpoint: ''
    //   }
    // });
    // this._uploadArea.render(this.$view.find('.js-upload-container'));

    this._croppingArea = new CroppingArea({
      cropWidth: this._model.get('cropSize').width,
      cropHeight: this._model.get('cropSize').height
    });
    this._croppingArea.render(this.$view.find('.js-crop-container'));

    this._zoomSlider = new ZoomSlider({
      cropWidth: this._model.get('cropSize').width,
      cropHeight: this._model.get('cropSize').height
    });
    this._zoomSlider.render(this.$view.find('.js-crop-controls'));

    if (this._model.get('showSuggestions')) {
      this._suggestionArea = new SuggestionArea({
        suggestions: this._model.get('suggestions')
      });
      this._suggestionArea.render(this.$view.find('.js-suggestions'));
    }

    this._croppingArea.relay(this._zoomSlider, 'scale');
    this._croppingArea.relay(this._suggestionArea, 'set-image');
    this._zoomSlider.relay(this._croppingArea, 'image-loaded');
  },

  mustache: template
});

const Helicropter = Controller.extend({
}, {
  VIEW_CLASS: HelicropterView
});

export default Helicropter;
