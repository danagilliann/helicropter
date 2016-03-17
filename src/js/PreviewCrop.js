import View from 'beff/View';
import { fabric } from 'fabric';
import mustache from 'hgn!../templates/preview-crop';
import uploadIcon from 'hgn!../templates/icons/upload';

const animationRequest = Symbol('animation request');
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

    this._$upload.css({
      width: this._model.cropWidth * proportion,
      height: this._model.cropHeight * proportion
    });

    this._$upload.find('.js-upload-button').on('click', () => this.trigger('upload-image'));
  },

  removeImage() {
    this._$upload.removeClass('hide');
    this.$view.find('.js-preview-crop-canvas').addClass('hide');

    if (this._image) {
      this._canvas.remove(this._image);
      this._image = null;
    }
  },

  renderImage({image, scale, top, left, cropWidth, cropHeight}) {
    this._$upload.addClass('hide');
    this.$view.find('.js-preview-crop-canvas').removeClass('hide');

    // This happens in image rendering because at this point in the lifecycle,
    // The crop area's dimensions have already been adjusted beyond the dimensions
    // specified in the config
    if (!this._canvas) {
      this._createCanvas({cropWidth, cropHeight});
    }

    return this._loadImage(image)
    .then(image => {
      this.on('scaling', this._onImageScale);

      this._drawNewImage({image, scale});
      this._adjustImagePosition({top, left});
      this._renderCanvas();
    });
  },

  _createCanvas({cropWidth, cropHeight}) {
    const $canvas = this.$view.find('.js-preview-crop-canvas');

    $canvas.prop({
      width: cropWidth * proportion,
      height: cropHeight * proportion
    });

    this._canvas = new fabric.Canvas($canvas[0], {
      selection: false,
      renderOnAddRemove: false,
      evented: false,
      // When the canvas is loaded with an image, fabric adds
      // a container that we'd like to hide when switching to
      // the no-image state. Without an initial image, there is
      // no fabric wrapping container. This shared class lets us
      // target both the container and/or the canvas
      containerClass: 'js-preview-crop-canvas'
    });
  },

  _adjustImagePosition({left, top}) {
    this._image.set('left', proportion * left);
    this._image.set('top', proportion * top);
    this._image.setCoords();
    this._renderCanvas();
  },

  _onImageScale({scale, left, top}) {
    this._image.scale(proportion * scale).setCoords();
    this._adjustImagePosition({left, top});
    this._renderCanvas();
  },

  _loadImage(imageData) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onerror = () => reject();
      image.onload = () => resolve(image);
      image.src = imageData;
    });
  },

  _renderCanvas() {
    if (!this._canvas || this[animationRequest]) { return; }

    this[animationRequest] = true;
    window.requestAnimationFrame(() => {
      this._canvas.renderAll();
      this[animationRequest] = false;
    });
  },

  _drawNewImage({image, scale}) {
    if (this._image) {
      this._canvas.remove(this._image);
    }

    this._image = new fabric.Image(image, {
      left: 0,
      top: 0,
      originX: 'left',
      originY: 'top',
      hasBorders: false,
      hasControls: false,
      lockMovementX: true,
      lockMovementY: true,
      hoverCursor: 'inherit'
    });

    this._image.scale(proportion * scale);
    this._image.setCoords();
    this._canvas.add(this._image);
    this._canvas.renderAll();
  }
});
