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
});
