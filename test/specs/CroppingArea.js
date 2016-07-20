import CroppingArea from 'CroppingArea';

function createCroppingArea($el, data = {}) {
  const croppingArea = new CroppingArea(data);
  croppingArea.render($el);
  return croppingArea;
}

describe('CroppingArea', function() {
  beforeEach(function() {
    this.$el = affix('.js-cropping-area-parent');
    this.croppingArea = createCroppingArea(this.$el);
  });

  afterEach(function() {
    this.croppingArea.destroy();
  });

  it('renders', function() {
    expect(this.$el.find('.js-cropper-canvas')).toExist();
  });

  describe('#getCropData', function() {
    it('returns undefined if no image is defined', function() {
      expect(this.croppingArea.getCropData()).not.toBeDefined();
    });

    it('does not allow x/y coordinates less than 0', function() {
      spyOn(this.croppingArea, '_getImageProp').and.returnValue(1);
      spyOn(this.croppingArea, '_getCropAreaProp').and.returnValue(0);

      this.croppingArea._cropArea = {
        getWidth: () => 100,
        getHeight: () => 50
      };

      this.croppingArea._image = { getScaleX: () => 1.0 };

      expect(this.croppingArea.getCropData()).toEqual({
        x: 0,
        y: 0,
        width: 100,
        height: 50,
        scale: 1.0
      });
    });
  });
});
