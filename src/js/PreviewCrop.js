import View from 'beff/View';
import { fabric } from 'fabric';
import mustache from 'hgn!../templates/preview-crop';

export default View.extend({
  mustache,

  rendered() {
    this._$canvas = this.$view.find('.js-preview-crop-canvas');
    this._$canvas.prop(this._model.size);

    this._canvas = new fabric.Canvas(this._$canvas[0], {
      selection: false,
      renderOnAddRemove: false,
      evented: false
    });

    this.on('data-url', this._onImageData);
  },

  _onImageData({dataUrl, cropArea: {width, height}}) {
    this._scaleRatio = {
      x: this._model.size.width / width,
      y: this._model.size.height / height
    };

    // TODO: Handle image load error
    this._loadImage(dataUrl).then(image => this._drawNewImage(image));
  },

  _loadImage(imageData) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onerror = () => reject();
      image.onload = () => resolve(image);
      image.src = imageData;
    });
  },

  _drawNewImage(image) {
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
      hoverCursor: 'inherit',
      scaleX: this._scaleRatio.x,
      scaleY: this._scaleRatio.y
    });

    this._image.setCoords();
    this._canvas.add(this._image);
    this._canvas.renderAll();
  }
});
