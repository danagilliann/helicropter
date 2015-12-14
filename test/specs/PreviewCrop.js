import PreviewCrop from 'PreviewCrop';

function createPreviewCrop($el, data = {}) {
  const previewCrop = new PreviewCrop(data);
  previewCrop.render($el);
  return previewCrop;
}

describe('PreviewCrop', function() {
  beforeEach(function() {
    this.$el = affix('.js-preview-crop-parent');
    this.previewCrop = createPreviewCrop(this.$el, {
      size: {
        width: 202,
        height: 158
      }
    });
  });

  afterEach(function() {
    this.previewCrop.destroy();
  });

  it('renders', function() {
    expect(this.$el.find('.js-preview-crop-canvas').length).not.toBe(0);
  });
});
