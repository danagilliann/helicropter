import extend from 'nbd/util/extend';
import Controller from 'beff/Controller';
import View from 'beff/View';

import UploadArea from './UploadArea';
import CroppingArea from './CroppingArea';
import ZoomSlider from './ZoomSlider';
import RatioLock from './RatioLock';
import SuggestionArea from './SuggestionArea';
import PreviewCrop from './PreviewCrop';

import template from 'hgn!../templates/wrapper';

const HelicropterView = View.extend({
  mustache: template,

  rendered() {
    this._addCroppingArea();

    if (this._model.get('previewMode')) {
      if (this._model.get('initialImage')) {
        this._croppingArea.trigger('set-image', this._model.get('initialImage').src, this._model.get('initialImage').coordinates);
      }

      return;
    }

    this._addUploadArea();
    this._addZoomSlider();
    this._addRatioLock();
    this._addSuggestionArea();
    this._addPreviewCrop();

    this._bindSubsections();
    this._setInitialState();
  },

  getCropData() {
    if (!this._url) { return; }

    return {
      src: this._src,
      url: this._url,
      coordinates: this._croppingArea.getCropData()
    };
  },

  setCropperAspectRatio(ratio) {
    if (!this._croppingArea) { return; }

    this._croppingArea.trigger('update-ratio', ratio);
  },

  _addUploadArea() {
    this._uploadArea = new UploadArea({
      uploaderOptions: this._model.get('uploaderOptions'),
      backgroundImage: this._model.get('uploadBackgroundImage'),
      width: this._model.get('canvasSize').width,
      height: this._model.get('canvasSize').height,
      titleText: this._model.get('uploadTitle'),
      subtitleText: this._model.get('uploadSubtitle')
    });
    this._uploadArea.render(this.$view.find('.js-upload-container'));
  },

  _addCroppingArea() {
    this._croppingArea = new CroppingArea({
      canvasWidth: this._model.get('canvasSize').width,
      canvasHeight: this._model.get('canvasSize').height,
      cropWidth: this._model.get('cropSize').width,
      cropHeight: this._model.get('cropSize').height,
      displayedWidth: this._model.get('displayedWidth'),
      viewportRatio: this._model.get('viewportRatio'),
      cropRatio: this._model.get('cropRatio'),
      allowTransparency: this._model.get('allowTransparency'),
      previewMode: this._model.get('previewMode'),
      shouldBroadcastDataURL: !!this._model.get('previewCrop')
    });
    this._croppingArea.render(this.$view.find('.js-crop-container'));
  },

  _addZoomSlider() {
    this._zoomSlider = new ZoomSlider();
    this._zoomSlider.render(this.$view.find('.js-crop-controls'));
  },

  _addRatioLock() {
    if (this._model.get('showRatioLock')) {
      this._ratioLock = new RatioLock({
        labelText: this._model.get('ratioLockText'),
        checked: this._model.get('viewportRatio') === 'static'
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

  _addPreviewCrop() {
    const config = this._model.get('previewCrop');
    if (config) {
      if (!config.element) {
        throw new Error('previewCrop.element must be supplied in the configuration');
      }
      this._previewCrop = new PreviewCrop({
        size: config.size
      });
      this._previewCrop.render(config.element);
    }
  },

  _setInitialState() {
    const initialImage = this._model.get('initialImage');

    if (initialImage) {
      this._src = initialImage.src;
      this._url = initialImage.url;
      this._croppingArea.trigger('set-image', initialImage.src, initialImage.coordinates);
      this._enableImageManipulation();
    }
    else {
      this._disableImageManipulation();

      if (this._model.get('showRatioLock')) {
        this._ratioLock.disable();
      }
    }
  },

  _bindSubsections() {
    this._croppingArea.relay(this._zoomSlider, 'scale');
    this._zoomSlider.relay(this._croppingArea, 'image-loaded set-crop-size');

    this._croppingArea.on('image-loaded', () => this.trigger('image:loaded'));

    this.listenTo(this._uploadArea, {
      'image-uploading'() {
        this._disableImageManipulation();
        this.trigger('image:uploading');
      },

      'image-uploaded'({ src, url }) {
        this._enableImageManipulation();

        this._url = url;
        this._src = src;

        this._croppingArea.trigger('set-image', src);
        this.trigger('image:uploaded', url);
      },

      'upload-error'(err) {
        this.trigger('remove-image');
        this.trigger('error:upload', err);
      }
    });

    this.on('remove-image', () => this._disableImageManipulation());

    if (this._model.get('showRatioLock')) {
      this._croppingArea.relay(this._ratioLock, 'ratio-locked');

      this._uploadArea.on('set-image', () => this._ratioLock.enable());

      this.on('controls:enabled', () => this._ratioLock.enable());
      this.on('remove-image controls:disabled', () => this._ratioLock.disable());

      if (this._model.get('showSuggestions')) {
        this._suggestionArea.on('set-image', () => this._ratioLock.enable());
      }
    }

    if (this._model.get('showSuggestions')) {
      this._uploadArea.relay(this._suggestionArea, 'upload-image');

      this.on('remove-image', () => this._suggestionArea.reset());
      this._uploadArea.on('set-image', () => this._suggestionArea.reset());
      this._suggestionArea.on('set-image', ({ url, src }) => {
        this._url = url;
        this._src = src;
        this._enableImageManipulation();
        this._croppingArea.trigger('set-image', src);
      });
    }

    if (this._model.get('previewCrop')) {
      this._previewCrop.relay(this._croppingArea, 'data-url');
    }
  },

  _enableImageManipulation() {
    this._uploadArea.hide();

    this._croppingArea.show();

    this._zoomSlider.reset();
    this._zoomSlider.enable();

    this.trigger('controls:enabled');
  },

  _disableImageManipulation() {
    delete this._src;
    delete this._url;

    this._uploadArea.show();

    this._croppingArea.reset();
    this._croppingArea.hide();

    this._zoomSlider.disable();

    this.trigger('controls:disabled');
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
    previewMode: false,
    viewportRatio: 'static',
    ratioLockText: 'Enable aspect ratio for cover image resize',
    allowTransparency: true,
    showRatioLock: false,
    showSuggestions: false,
    suggestions: []
  },

  init(model) {
    this._super(extend({}, this._defaults, model));

    this.relay(this._view, 'controls:enabled controls:disabled image:uploading image:uploaded image:loaded error:upload');
  },

  crop() {
    return this._view.getCropData();
  },

  changeAspectRatio(ratio) {
    this._view.setCropperAspectRatio(ratio);
  },

  removeImage() {
    this._view.trigger('remove-image');
  }
}, {
  VIEW_CLASS: HelicropterView
});

export default Helicropter;
