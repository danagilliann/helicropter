import Controller from 'BeFF/Controller';
import View from 'BeFF/View';

import UploadArea from './UploadArea';
import CroppingArea from './CroppingArea';
import ZoomSlider from './ZoomSlider';
import RatioLock from './RatioLock';
import SuggestionArea from './SuggestionArea';

import template from '../templates/wrapper.mustache';

const HelicropterView = View.extend({
  mustache: template,

  rendered() {
    this._addUploadArea();
    this._addCroppingArea();
    this._addZoomSlider();
    this._addRatioLock();
    this._addSuggestionArea();

    this._bindSubsections();
  },

  _addUploadArea() {
    this._uploadArea = new UploadArea({
      request: {
        endpoint: '',
        accessKey: ''
      },
      signature: {
        endpoint: '/s3handler'
      }
    });
    this._uploadArea.render(this.$view.find('.js-upload-container'));
  },

  _addCroppingArea() {
    this._croppingArea = new CroppingArea({
      canvasWidth: this._model.get('canvasSize').width,
      canvasHeight: this._model.get('canvasSize').height,
      cropWidth: this._model.get('cropSize').width,
      cropHeight: this._model.get('cropSize').height
    });
    this._croppingArea.render(this.$view.find('.js-crop-container'));
  },

  _addZoomSlider() {
    this._zoomSlider = new ZoomSlider({
      cropWidth: this._model.get('cropSize').width,
      cropHeight: this._model.get('cropSize').height
    });
    this._zoomSlider.render(this.$view.find('.js-crop-controls'));
  },

  _addRatioLock() {
    if (this._model.get('showRatioLock')) {
      this._ratioLock = new RatioLock({
        labelText: this._model.get('ratioLockText')
      });
      this._ratioLock.render(this.$view.find('.js-crop-controls'));
    }
  },

  _addSuggestionArea() {
    if (this._model.get('showSuggestions')) {
      this._suggestionArea = new SuggestionArea({
        suggestions: this._model.get('suggestions')
      });
      this._suggestionArea.render(this.$view.find('.js-suggestions'));
    }
  },

  _bindSubsections() {
    this._croppingArea.relay(this._zoomSlider, 'scale');
    this._croppingArea.relay(this._uploadArea, 'set-image');
    this._zoomSlider.relay(this._croppingArea, 'image-loaded');

    if (this._model.get('showRatioLock')) {
      this._croppingArea.relay(this._ratioLock, 'ratio-locked');
    }

    if (this._model.get('showSuggestions')) {
      this._croppingArea.relay(this._suggestionArea, 'set-image');
      this._uploadArea.relay(this._suggestionArea, 'upload-image');
    }
  }
});

const Helicropter = Controller.extend({
}, {
  VIEW_CLASS: HelicropterView
});

export default Helicropter;
