import extend from 'nbd/util/extend';
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

  getCropData() {
    return {
      url: this._url,
      coordinates: this._croppingArea.getCropData()
    };
  },

  _addUploadArea() {
    this._uploadArea = new UploadArea(this._model.get('uploaderOptions'));
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

    this._croppingArea.hide();
  },

  _addZoomSlider() {
    this._zoomSlider = new ZoomSlider({
      cropWidth: this._model.get('cropSize').width,
      cropHeight: this._model.get('cropSize').height
    });
    this._zoomSlider.render(this.$view.find('.js-crop-controls'));

    this._zoomSlider.disable();
  },

  _addRatioLock() {
    if (this._model.get('showRatioLock')) {
      this._ratioLock = new RatioLock({
        labelText: this._model.get('ratioLockText')
      });
      this._ratioLock.render(this.$view.find('.js-crop-controls'));

      this._ratioLock.disable();
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

    this._uploadArea.on('image-uploaded', (url) => this._url = url);
    this._uploadArea.on('set-image', () => this._enableImageManipulation());
    this.on('remove-image', () => this._disableImageManipulation());

    if (this._model.get('showRatioLock')) {
      this._croppingArea.relay(this._ratioLock, 'ratio-locked');

      this._uploadArea.on('set-image', () => this._ratioLock.enable());
      this.on('remove-image', () => this._ratioLock.disable());

      if (this._model.get('showSuggestions')) {
        this._suggestionArea.on('set-image', () => this._ratioLock.enable());
      }
    }

    if (this._model.get('showSuggestions')) {
      this._croppingArea.relay(this._suggestionArea, 'set-image');
      this._uploadArea.relay(this._suggestionArea, 'upload-image');

      this._suggestionArea.on('set-image', (url) => {
        this._url = url;
        this._enableImageManipulation();
      });
    }
  },

  _enableImageManipulation() {
    this._uploadArea.hide();
    this._croppingArea.show();
    this._zoomSlider.enable();
  },

  _disableImageManipulation() {
    this._uploadArea.show();
    this._croppingArea.reset();
    this._croppingArea.hide();
    this._zoomSlider.disable();
  }
});

const Helicropter = Controller.extend({
  _defaults: {
    uploaderOptions: {
      request: {
        endpoint: '',
        accessKey: ''
      },
      signature: {
        endpoint: ''
      }
    },
    canvasSize: {
      width: 432,
      height: 300
    },
    cropSize: {
      width: 320,
      height: 250
    },
    showRatioLock: false,
    showSuggestions: false,
    suggestions: []
  },

  init(model) {
    this._super(extend({}, this._defaults, model));
  },

  crop() {
    return this._view.getCropData();
  },

  removeImage() {
    this._view.trigger('remove-image');
  }
}, {
  VIEW_CLASS: HelicropterView
});

export default Helicropter;
