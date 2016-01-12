import Promise from 'nbd/Promise';
import extend from 'nbd/util/extend';
import View from 'beff/View';
import { fabric } from 'fabric';

import transparencyImage from '../img/bg-cropper.gif';
import template from 'hgn!../templates/crop-area';

const MAX_SCALE = 1.0;
const MINIMUM_SCALE_DIFFERENCE = 0.01;
const MINIMUM_PADDING = 20;

const animationRequest = Symbol('animation request');

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

    if (this._model.cropRatio) {
      this._setCropSizeByAspectRatio(this._model.cropRatio);
    }

    this._createTransparencyBackground();

    if (this._model.viewportRatio === 'static') {
      this._createStaticCropArea();
    }
    else if (this._model.viewportRatio === 'dynamic') {
      this._createDynamicCropArea();
    }

    this._createImage();
    this._createBlurryWarning();

    this.on({
      scale(scaleValue) {
        if (this._image) {
          this._scaleImage(scaleValue);
          this._checkPotentialBlurriness(scaleValue);
        }
      },

      'set-image'(imageSrc, coordinates) {
        this._model.image = imageSrc;
        this._createImage(coordinates)
        .catch((err) => console.error(err));
      },

      'ratio-locked'(ratioLocked) {
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
      },

      'update-ratio'(ratio) {
        this._setCropSizeByAspectRatio(ratio);
        this._removeOverlay();

        if (this._cropArea) {
          this._canvas.remove(this._cropArea);
        }

        this._createStaticCropArea();

        this.trigger('set-crop-size', {
          minScale: this._calculateScaleBound()
        });
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
    if (!this._image) { return; }

    return {
      x: (this._getImageProp('left') * -1) + this._getCropAreaProp('left'),
      y: (this._getImageProp('top') * -1) + this._getCropAreaProp('top'),
      width: this._cropArea.getWidth(),
      height: this._cropArea.getHeight(),
      scale: this._image.getScaleX()
    };
  },

  _setCropSizeByAspectRatio(ratio) {
    const maxWidth = this._model.canvasWidth - (MINIMUM_PADDING * 2);
    const maxHeight = this._model.canvasHeight - (MINIMUM_PADDING * 2);

    const widthAtMaxHeight = (maxHeight / ratio.height) * ratio.width;
    const heightAtMaxWidth = (maxWidth / ratio.width) * ratio.height;

    if (widthAtMaxHeight < maxWidth) {
      this._model.cropWidth = widthAtMaxHeight;
      this._model.cropHeight = maxHeight;
    }
    else {
      this._model.cropWidth = maxWidth;
      this._model.cropHeight = heightAtMaxWidth;
    }
  },

  _createTransparencyBackground() {
    return this._loadImage(transparencyImage)
    .then((image) => {
      const pattern = new fabric.Pattern({
        source: image,
        repeat: 'repeat'
      });

      const patternRect = new fabric.Rect({
        left: 0,
        top: 0,
        width: this._model.canvasWidth * 2,
        height: this._model.canvasHeight * 2,
        fill: pattern,
        selectable: false,
        evented: false,
        hasBorders: false,
        hasControls: false
      });

      this._canvas.add(patternRect);
      patternRect.sendToBack();
      patternRect.scale(0.5).setCoords();
      patternRect.center().setCoords();
    });
  },

  _createImage(coordinates = {}) {
    if (!this._model.image) { return Promise.resolve(); }

    return this._loadImage(this._model.image)
    .then((image) => {
      if (this._image) {
        this._image.remove();
      }

      this._image = new fabric.Image(image, {
        left: 0,
        top: 0,
        originX: 'left',
        originY: 'top',
        selectable: !this._model.previewMode,
        hasBorders: false,
        hasControls: false
      });

      this._canvas.add(this._image);
      this._image.sendToBack();
      this._image.bringForward();

      const normalizedCoordinates = this._normalizeCoordinates(coordinates);

      this._image.scale(normalizedCoordinates.scale).setCoords();
      this._image.center();

      if (normalizedCoordinates.x !== null) {
        this._image.set('left', this._getCropAreaProp('left') - normalizedCoordinates.x);
      }

      if (normalizedCoordinates.y !== null) {
        this._image.set('top', this._getCropAreaProp('top') - normalizedCoordinates.y);
      }

      this._checkPotentialBlurriness(normalizedCoordinates.scale);

      this._image.setCoords();
      this._renderCanvas();

      this._image.on('moving', () => {
        this._checkImageBounds();
        this._canvas.setActiveObject(this._cropArea);
        this._broadcastDataURL();
      });

      this.trigger('image-loaded', {
        width: this._image.get('width'),
        height: this._image.get('height'),
        scale: normalizedCoordinates.scale,
        minScale: normalizedCoordinates.minScale,
        cropWidth: this._model.cropWidth,
        cropHeight: this._model.cropHeight
      });

      this._broadcastDataURL();
    });
  },

  _broadcastDataURL() {
    if (!this._model.shouldBroadcastDataURL) { return; }

    const {width, height, scale} = this.getCropData();
    const dataUrl = this._canvas.toDataURL({
      left: this._getCropAreaProp('left'),
      top: this._getCropAreaProp('top'),
      width,
      height
    });

    this.trigger('data-url', {
      dataUrl,
      // For scaling needs
      cropArea: {
        width: width,
        height: height,
        scale: scale
      }
    });
  },

  _normalizeCoordinates(coordinates = {}) {
    const minScale = this._calculateScaleBound();

    coordinates = extend({
      x: null,
      y: null,
      width: null,
      height: null,
      scale: minScale,
      minScale: minScale
    }, coordinates);

    if (coordinates.width === null && coordinates.height === null) {
      return coordinates;
    }

    const widthScale = this._getCropAreaProp('width') / coordinates.width;
    const heightScale = this._getCropAreaProp('height') / coordinates.height;

    // It's possible that the width and height provided are in a different
    // aspect ratio than the current aspect ratio set. If this is the case,
    // ignore the calculated scales and reset the offset point.
    if (Math.abs(widthScale - heightScale) < MINIMUM_SCALE_DIFFERENCE) {
      coordinates.scale = widthScale;
      coordinates.x = coordinates.x !== null ? coordinates.x * widthScale : null;
      coordinates.y = coordinates.y  !== null ? coordinates.y * widthScale : null;
    }
    else {
      coordinates.scale = minScale;
      coordinates.x = null;
      coordinates.y = null;
    }

    return coordinates;
  },

  _calculateScaleBound() {
    if (!this._image) { return MAX_SCALE; }

    const lowerBoundFn = this._model.allowTransparency ? Math.min : Math.max;
    const widthScaleMin = this._model.cropWidth / this._image.get('width');
    const heightScaleMin = this._model.cropHeight / this._image.get('height');

    return lowerBoundFn(widthScaleMin, heightScaleMin);
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
    this._renderCanvas();

    this._broadcastDataURL();
  },

  _checkPotentialBlurriness(currentScale) {
    if (!this._model.displayedWidth || !currentScale) { return; }

    if (this._cropArea.getWidth() / currentScale < this._model.displayedWidth) {
      this._showBlurryWarning();
    }
    else {
      this._hideBlurryWarning();
    }
  },

  _checkImageBounds() {
    const leftDelta = this._getImageProp('left');
    const topDelta = this._getImageProp('top');

    const widthBelowScale = this._image.getWidth() < this._cropArea.getWidth();
    const heightBelowScale = this._image.getHeight() < this._cropArea.getHeight();

    const maxLeftDelta = this._getCropAreaProp('left');
    const maxTopDelta = this._getCropAreaProp('top');
    const minLeftDelta = -this._image.getWidth() + (this._getCropAreaProp('left') + this._cropArea.getWidth());
    const minTopDelta = -this._image.getHeight() + (this._getCropAreaProp('top') + this._cropArea.getHeight());

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
    this._cropArea = new fabric.Rect({
      originX: 'left',
      originY: 'top',
      selectable: false,
      evented: false,
      width: this._model.cropWidth,
      height: this._model.cropHeight,
      fill: 'transparent',
      stroke: 'rgba(37, 38, 42, 1.0)',
      hasBorders: false,
      hasControls: false
    });

    this._canvas.add(this._cropArea);
    this._cropArea.center().setCoords();

    this._createOverlay();
  },

  _createDynamicCropArea() {
    this._cropArea = new fabric.Rect({
      width: this._model.cropWidth,
      height: this._model.cropHeight,
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

      this._checkImageBounds();
    });

    this._cropArea.on('scaling', () => {
      this._checkCanvasBounds();

      this._removeOverlay();
      this._createOverlay();

      this._cropArea.bringToFront();
      this._canvas.setActiveObject(this._cropArea);
    });
  },

  _getCropAreaProp(prop) {
    return Math.round(this._cropArea.get(prop));
  },

  _getImageProp(prop) {
    return Math.round(this._image.get(prop));
  },

  _createOverlay() {
    const topOffset = this._getCropAreaProp('top');
    const leftOffset = this._getCropAreaProp('left');
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
  },

  _createBlurryWarning() {
    if (!this._model.displayedWidth) { return; }

    const warningBox = new fabric.Rect({
      height: 40,
      width: this._model.canvasWidth,
      fill: 'rgba(37, 38, 42, 0.9)',
      originX: 'center',
      originY: 'center',
      selectable: false,
      evented: false
    });

    const warningMessage = new fabric.Text('This zoom level will blur your cover image', {
      height: 40,
      width: this._model.canvasWidth,
      fill: 'rgba(255, 255, 255, 1.0)',
      fontFamily: 'Helvetica Neue',
      fontSize: 13,
      fontWeight: 500,
      originX: 'center',
      originY: 'center',
      textAlign: 'center'
    });

    this._warningBox = new fabric.Group([warningBox, warningMessage], {
      top: this._model.canvasHeight,
      left: 0,
      height: 40,
      width: this._model.canvasWidth,
      originX: 'left',
      originY: 'top',
      selectable: false,
      evented: false
    });

    this._canvas.add(this._warningBox);
  },

  _showBlurryWarning() {
    if (!this._warningBox) { return; }

    this._warningBox.bringToFront();
    this._warningBox.animate('top', this._model.canvasHeight - 40, {
      onChange: () => this._renderCanvas(),
      duration: 250,
      easing: fabric.util.ease.easeOutQuad
    });
  },

  _hideBlurryWarning() {
    if (!this._warningBox) { return; }

    this._warningBox.animate('top', this._model.canvasHeight, {
      onChange: () => this._renderCanvas(),
      duration: 250,
      easing: fabric.util.ease.easeInQuad
    });
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
  }
});
