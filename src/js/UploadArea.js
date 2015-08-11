import $ from 'jquery';
import CloudUploader from 'BeFF/Component/CloudUploader';
import View from 'BeFF/View';

import template from '../templates/upload-area.mustache';

const Uploader = CloudUploader.extend({
  init($uploadBtn, options) {
    let config = {};

    if (!options) {
      options = $uploadBtn;
      $uploadBtn = null;
    }
    else {
      config.button = $uploadBtn;
    }

    $.extend(config, {
      cors: {
        expected: true,
        sendCredentials: true
      },
      validation: {
        sizeLimit: 8388608,
        allowedExtensions: ['jpg', 'jpeg', 'png', 'gif'],
        image: {
          minHeight: 316,
          minWidth: 404
        },
        acceptFiles: 'image/*'
      }
    }, options);

    return this._super(config);
  }
});

export default View.extend({
  _defaults: {
    titleText: 'Upload Image',
    subtitleText: ''
  },

  mustache: template,

  templateData() {
    this._model.titleText = this._model.titleText || this._defaults.titleText;
    this._model.subtitleText = this._model.subtitleText || this._defaults.subtitleText;

    return this._model;
  },

  rendered() {
    this._$container = this.$view.parent();

    this._uploader = new Uploader(this.$view[0], this._model.uploaderOptions);

    this._$container.css({
      width: this._model.width,
      height: this._model.height
    });

    this._bindUploader();
    this.on('upload-image', () => this._uploadImage());
  },

  hide() {
    this._$container.addClass('hide');
  },

  show() {
    this._$container.removeClass('hide');
  },

  _uploadImage() {
    this._uploader.choose();
  },

  _bindUploader() {
    this.listenTo(this._uploader, {
      submit({ file }) {
        this.hide();
        this.trigger('set-image', file.readerData.result);
      },

      complete(data) {
        this._url = `${data.uploadEndpoint}/${data.uploadPath}`;
        this.trigger('image-uploaded', this._url);
      },

      error(err) {
        console.error(err);
      }
    });
  }
});

