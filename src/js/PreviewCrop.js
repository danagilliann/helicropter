import View from 'beff/View';
import $ from 'jquery';
import mustache from 'hgn!../templates/preview-crop';
import uploadIcon from 'hgn!../templates/icons/upload';

const proportion = 0.5;

export {proportion};

export default View.extend({
  mustache,

  partials: {
    uploadIcon: uploadIcon.template
  },

  rendered() {
    this.on('moving', this._adjustImagePosition);
    this.on('image-loaded', this.renderImage);
    this.on('remove-image', this.removeImage);

    this._$upload = this.$view.find('.js-preview-upload-container');
    this._$canvas = this.$view.find('.js-preview-crop-canvas');

    this._$canvas.css({
      position: 'relative',
      overflow: 'hidden'
    });

    this._$upload.add(this._$canvas).css({
      width: this._model.cropWidth * proportion,
      height: this._model.cropHeight * proportion
    });

    this._$upload.find('.js-upload-button').on('click', () => this.trigger('upload-image'));
  },

  removeImage() {
    this._$upload.removeClass('hide');
    this._$canvas.addClass('hide');
  },

  renderImage({image, scale, top, left, cropWidth, cropHeight}) {
    this._$upload.addClass('hide');

    // Setting canvas width and height happens here rather than init because only at this point
    // are the crop area's dimensions been adjusted beyond the dimensions specified in the config.
    this._prepareCanvas(cropWidth, cropHeight);

    return this._loadImage(image)
    .then(() => {
      this.on('scaling', ({scale, left, top}) => {
        this._scale(scale);
        this._adjustImagePosition({left, top});
      });

      this._scale(scale);
      this._adjustImagePosition({top, left});
    });
  },

  _prepareCanvas(cropWidth, cropHeight) {
    this._$canvas
    .css({
      width: cropWidth * proportion,
      height: cropHeight * proportion
    })
    .removeClass('hide')
    .empty();
  },

  _adjustImagePosition({left, top}) {
    this._$image.css('left', proportion * left);
    this._$image.css('top', proportion * top);
  },

  _loadImage(url) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onerror = () => reject();
      image.onload = () => resolve(image);
      image.src = url;

      this._$image = $(image);
      this._$image
      .css('position', 'absolute')
      .appendTo(this._$canvas);
    });
  },

  _scale(scale) {
    var realScale = proportion * scale;
    this._$image.css('width', this._$image[0].naturalWidth * realScale);
    this._$image.css('height', this._$image[0].naturalHeight * realScale);
  }
});
