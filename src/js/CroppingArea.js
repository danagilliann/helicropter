import extend from 'nbd/util/extend';
import View from 'BeFF/View';
import { fabric } from 'fabric';

import template from '../templates/crop-area.mustache';

export default View.extend({
  mustache: template,

  rendered() {
    this._$canvas = this.$view.find('.js-cropper-canvas');
    this._$canvas.prop({
      width: 432,
      height: 300
    });

    this._canvas = new fabric.Canvas(this._$canvas[0], {
      selection: false
    });

    this._createImage();
    this._createCropArea();
    this._createOverlay();

    this.on('scale', (scaleValue) => {
      if (!scaleValue) { return; }

      console.log(scaleValue);

      this._image.scale(scaleValue).setCoords();
      this._image.center().setCoords();
      this._canvas.renderAll();
    });
  },

  _createImage() {
    const image = new Image();
    image.onload = () => {
      this._image = new fabric.Image(image, {
        left: 0,
        top: 0,
        originX: 'left',
        originY: 'top',
        hasBorders: false,
        hasControls: false
      });

      this._canvas.add(this._image);
      this._image.sendToBack();
      this._image.scale(1.0).setCoords();
      this._image.center().setCoords();

      console.log(320 / this._image.get('width'));
      console.log(250 / this._image.get('height'));

      this._setScaleStep();

      this._image.on('moving', () => this._checkImageBounds());

      this.trigger('image-loaded', {
        width: this._image.get('width'),
        height: this._image.get('height')
      });
    };
    image.src = '/demo/test-kitten.jpeg';
  },

  _checkImageBounds() {
    const leftDelta = this._image.get('left');
    const topDelta = this._image.get('top');

    const maxLeftDelta = this._cropArea.get('left');
    const maxTopDelta = this._cropArea.get('top');
    const minLeftDelta = -this._image.getWidth() + (this._cropArea.get('left') + this._cropArea.get('width'));
    const minTopDelta = -this._image.getHeight() + (this._cropArea.get('top') + this._cropArea.get('height'));

    if (leftDelta > maxLeftDelta) {
      this._image.set('left', maxLeftDelta);
    }
    if (topDelta > maxTopDelta) {
      this._image.set('top', maxTopDelta);
    }

    if (leftDelta < minLeftDelta) {
      this._image.set('left', minLeftDelta);
    }
    if (topDelta < minTopDelta) {
      this._image.set('top', minTopDelta);
    }
  },

  // TODO: Need to draw two objects:
  // 1. Crop Area with solid borders when the crop area is static
  // 2. Crop Area with dashed borders and handles when the crop area is dynamic
  _createCropArea() {
    this._cropAreaViewport = new fabric.Rect({
      originX: 'left',
      originY: 'top',
      left: 1,
      top: 1,
      width: 320,
      height: 250,
      fill: 'transparent'
    });

    this._cropAreaBorder = new fabric.Rect({
      originX: 'left',
      originY: 'top',
      width: 322,
      height: 252,
      fill: 'transparent',
      stroke: 'rgba(37, 38, 42, 1.0)'
    });

    this._cropArea = new fabric.Group([this._cropAreaViewport, this._cropAreaBorder], {
      originX: 'left',
      originY: 'top',
      selectable: false,
      evented: false
    });

    this._canvas.add(this._cropArea);
    this._cropArea.center().setCoords();
  },

  // -- Points fo figure out where to create
  // -- overlay boxes
  //
  //
  //    x0    x1        x2      x3
  // y0 +------------------------+
  //    |\\\\\\\\\\\\\\\\\\\\\\\\|
  //    |\\\\\\\\\\\\\\\\\\\\\\\\|
  // y1 +------+---------+-------+
  //    |\\\\\\|         |\\\\\\\|
  //    |\\\\\\|    0    |\\\\\\\|
  //    |\\\\\\|         |\\\\\\\|
  // y2 +------+---------+-------+
  //    |\\\\\\\\\\\\\\\\\\\\\\\\|
  //    |\\\\\\\\\\\\\\\\\\\\\\\\|
  // y3 +------------------------+
  //
  _createOverlay() {
    [
      { left: 0, top: 0, height: 25, width: 450 },
      { left: 0, top: 25, height: 250, width: 56 },
      { left: 376, top: 25, height: 250, width: 56 },
      { left: 0, top: 275, height: 25, width: 450 }
    ].forEach((box) => {
      const data = extend(box, {
        fill: 'rgba(37, 38, 42, 0.6)',
        selectable: false,
        evented: false
      });
      this._canvas.add(new fabric.Rect(data));
    });
  },

  _setScaleStep() {
    const widthRatio = this._cropAreaViewport.get('width') / this._image.get('width');
    const heightRatio = this._cropAreaViewport.get('height') / this._image.get('height');

    this._scaleStep = (1 - Math.min(widthRatio, heightRatio)) / 100;
  }
});
