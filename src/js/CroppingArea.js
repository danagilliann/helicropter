import extend from 'nbd/util/extend';
import View from 'beff/View';
import { fabric } from 'fabric';

import template from '../templates/crop-area.mustache';

export default View.extend({
  mustache: template,

  rendered() {
    this._$canvas = this.$view.find('.js-cropper-canvas');
    this._$canvas.prop({
      width: this._model.canvasWidth,
      height: this._model.canvasHeight
    });

    this._canvas = new fabric.Canvas(this._$canvas[0], {
      selection: false
    });

    this._canvas.on('mouse:down', () => this._canvas.setActiveObject(this._cropArea));
    this._canvas.on('mouse:move', () => this._canvas.setActiveObject(this._cropArea));
    this._canvas.on('mouse:up', () => this._canvas.setActiveObject(this._cropArea));

    this._createImage();
    this._createStaticCropArea();

    this.on({
      scale(scaleValue) { this._scaleImage(scaleValue); },

      ['set-image'](imageSrc) {
        this._model.image = imageSrc;
        this._createImage();
      },

      ['ratio-locked'](ratioLocked) {
        this._removeOverlay();

        if (this._cropArea) {
          this._canvas.remove(this._cropArea);
        }

        if (ratioLocked) {
          this._createStaticCropArea();
        }
        else {
          this._createDynamicCropArea();
        }
      }
    });
  },

  hide() {
    this.$view.addClass('hide');
  },

  show() {
    this.$view.removeClass('hide');
  },

  reset() {
    if (this._image) {
      this._canvas.remove(this._image);
      this._image = null;
    }
  },

  getCropData() {
    return {
      x: (this._image.get('left') * -1) + this._cropArea.get('left'),
      y: (this._image.get('top') * -1) + this._cropArea.get('top'),
      width: this._cropArea.getWidth(),
      height: this._cropArea.getHeight(),
      scale: this._image.getScaleX()
    };
  },

  _createImage() {
    if (!this._model.image) { return; }

    const image = new Image();
    image.onload = () => {
      if (this._image) {
        this._image.remove();
      }

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

      this._image.on('moving', () => {
        this._checkImageBounds();
        this._canvas.setActiveObject(this._cropArea);
      });

      this.trigger('image-loaded', {
        width: this._image.get('width'),
        height: this._image.get('height')
      });
    };

    image.src = this._model.image;
  },

  _scaleImage(scaleValue) {
    if (!scaleValue) { return; }

    const previousDimensions = {
      width: this._image.getWidth(),
      height: this._image.getHeight()
    };
    const previousCentroid = {
      left: (this._image.get('left') * -1) + this._cropArea.get('left') + (this._cropArea.getWidth() / 2),
      top: (this._image.get('top') * -1) + this._cropArea.get('top') + (this._cropArea.getHeight() / 2)
    };

    this._image.scale(scaleValue).setCoords();

    const postDimensions = {
      width: this._image.getWidth(),
      height: this._image.getHeight()
    };
    const postCentroid = {
      left: previousCentroid.left * (postDimensions.width / previousDimensions.width),
      top: previousCentroid.top * (postDimensions.height / previousDimensions.height)
    };

    this._image.set('left', this._image.get('left') + (previousCentroid.left - postCentroid.left));
    this._image.set('top', this._image.get('top') + (previousCentroid.top - postCentroid.top));
    this._image.setCoords();

    this._checkImageBounds();
    this._canvas.renderAll();
  },

  _checkImageBounds() {
    const leftDelta = this._image.get('left');
    const topDelta = this._image.get('top');

    const widthBelowScale = this._image.getWidth() < this._cropArea.getWidth();
    const heightBelowScale = this._image.getHeight() < this._cropArea.getHeight();

    const maxLeftDelta = this._cropArea.get('left');
    const maxTopDelta = this._cropArea.get('top');
    const minLeftDelta = -this._image.getWidth() + (this._cropArea.get('left') + this._cropArea.getWidth());
    const minTopDelta = -this._image.getHeight() + (this._cropArea.get('top') + this._cropArea.getHeight());

    if (widthBelowScale) {
      if (leftDelta < maxLeftDelta) {
        this._image.set('left', maxLeftDelta);
      }
      if (widthBelowScale && leftDelta > minLeftDelta) {
        this._image.set('left', minLeftDelta);
      }
    }
    else {
      if (leftDelta > maxLeftDelta) {
        this._image.set('left', maxLeftDelta);
      }
      if (leftDelta < minLeftDelta) {
        this._image.set('left', minLeftDelta);
      }
    }

    if (heightBelowScale) {
      if (topDelta < maxTopDelta) {
        this._image.set('top', maxTopDelta);
      }

      if (topDelta > minTopDelta) {
        this._image.set('top', minTopDelta);
      }
    }
    else {
      if (topDelta > maxTopDelta) {
        this._image.set('top', maxTopDelta);
      }

      if (topDelta < minTopDelta) {
        this._image.set('top', minTopDelta);
      }
    }
  },

  _checkCanvasBounds() {
    const leftBound = this._cropArea.get('left');
    const topBound = this._cropArea.get('top');
    const rightBound = leftBound + this._cropArea.getWidth();
    const bottomBound = topBound + this._cropArea.getHeight();

    if (leftBound < 0 || rightBound > this._model.canvasWidth) {
      this._cropArea.setScaleX(this._cropArea.lastScaleX || 1);
    }
    if (topBound < 0 || bottomBound > this._model.canvasHeight) {
      this._cropArea.setScaleY(this._cropArea.lastScaleY || 1);
    }

    if (leftBound < 0) {
      this._cropArea.set('left', 0);
    }
    if (topBound < 0) {
      this._cropArea.set('top', 0);
    }

    this._cropArea.lastScaleX = this._cropArea.getScaleX();
    this._cropArea.lastScaleY = this._cropArea.getScaleY();
  },

  _createStaticCropArea() {
    this._cropAreaViewport = new fabric.Rect({
      originX: 'left',
      originY: 'top',
      left: 1,
      top: 1,
      width: this._model.cropWidth,
      height: this._model.cropHeight,
      fill: 'transparent'
    });

    this._cropAreaBorder = new fabric.Rect({
      originX: 'left',
      originY: 'top',
      width: this._model.cropWidth + 2,
      height: this._model.cropHeight + 2,
      fill: 'transparent',
      stroke: 'rgba(37, 38, 42, 1.0)'
    });

    this._cropArea = new fabric.Group([this._cropAreaViewport, this._cropAreaBorder], {
      originX: 'left',
      originY: 'top',
      selectable: false,
      evented: false,
      hasBorders: false,
      hasControls: false
    });

    this._canvas.add(this._cropArea);
    this._cropArea.center().setCoords();

    this._createOverlay();
  },

  _createDynamicCropArea() {
    this._cropArea = new fabric.Rect({
      width: this._model.cropWidth + 2,
      height: this._model.cropHeight + 2,
      fill: 'transparent',
      borderColor: 'transparent',
      strokeDashArray: [5, 5],
      stroke: '#25262a',
      lockRotation: true,
      hasRotatingPoint: false,
      cornerColor: 'rgba(255, 255, 255, 1.0)',
      cornerSize: 5,
      lockMovementX: true,
      lockMovementY: true
    });

    this._canvas.add(this._cropArea);
    this._cropArea.center().setCoords();

    this._createOverlay();

    this._canvas.setActiveObject(this._cropArea);
    this._cropArea.bringToFront();

    this._cropArea.on('mousedown', ({ e }) => {
      if (!this._image) { return; }

      this._startingTransform = {
        x: this._image.get('left'),
        y: this._image.get('top')
      };

      this._startingPointer = this._canvas.getPointer(e);
    });

    this._cropArea.on('mouseup', () => {
      this._startingTransform = null;
      this._startingPointer = null;
    });

    this._cropArea.on('moving', ({ e }) => {
      if (!this._image) { return; }

      const currentPointer = this._canvas.getPointer(e);

      this._image.set('left', this._startingTransform.x + (currentPointer.x - this._startingPointer.x));
      this._image.set('top', this._startingTransform.y + (currentPointer.y - this._startingPointer.y));
    });

    this._cropArea.on('scaling', () => {
      this._checkCanvasBounds();

      this._removeOverlay();
      this._createOverlay();

      this._cropArea.bringToFront();
      this._canvas.setActiveObject(this._cropArea);
    });
  },

  _createOverlay() {
    const topOffset = Math.ceil(this._cropArea.get('top'));
    const leftOffset = Math.ceil(this._cropArea.get('left'));
    const rightOffset = Math.max(0, this._model.canvasWidth - (leftOffset + this._cropArea.getWidth()));
    const bottomOffset = Math.max(0, this._model.canvasHeight - (topOffset + this._cropArea.getHeight()));

    const overlayRects = [
      { left: 0, top: 0, height: topOffset, width: this._model.canvasWidth }, // Top Bar
      { left: 0, top: topOffset, height: this._cropArea.getHeight(), width: leftOffset }, // Left Bar
      { left: this._model.canvasWidth - rightOffset, top: topOffset, height: this._cropArea.getHeight(), width: rightOffset }, // Right Bar
      { left: 0, top: this._model.canvasHeight - bottomOffset, height: bottomOffset, width: this._model.canvasWidth } // Bottom Bar
    ].map((box) => {
      const data = extend(box, {
        fill: 'rgba(37, 38, 42, 0.6)',
        selectable: false,
        evented: false
      });

      return new fabric.Rect(data);
    });

    this._cropOverlay = new fabric.Group(overlayRects, {
      originX: 'left',
      originY: 'top',
      selectable: false,
      evented: false
    });

    this._canvas.add(this._cropOverlay);
  },

  _removeOverlay() {
    if (this._cropOverlay) {
      this._canvas.remove(this._cropOverlay);
      this._cropOverlay = null;
    }
  }
});
