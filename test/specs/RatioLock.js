import RatioLock from 'RatioLock';

function createRatioLock($el, data = {}) {
  const ratioLock = new RatioLock(data);
  ratioLock.render($el);
  return ratioLock;
}

describe('RatioLock', function() {
  beforeEach(function() {
    this.$el = affix('.js-ratio-lock-parent');
    this.ratioLock = createRatioLock(this.$el);
  });

  afterEach(function() {
    this.ratioLock.destroy();
  });

  it('renders', function() {
    expect(this.$el.find('.js-ratio-controls')).toExist();
  });

  it('sets the input\'s checked prop to true', function() {
    expect(this.$el.find('.js-ratio-lock')).toBeChecked();
  });

  it('sets the label to a sane default', function() {
    expect(this.$el.find('.js-ratio-lock-label')).toContainText('Enable aspect ratio for cover image resize');
  });

  describe('#render', function() {
    it('allows setting of the checked property of its input', function() {
      const ratioLock = createRatioLock(this.$el, { checked: false });

      expect(ratioLock.$view.find('.js-ratio-lock')).not.toBeChecked();
      ratioLock.destroy();
    });

    it('allows setting of the label for its input', function() {
      const ratioLock = createRatioLock(this.$el, { labelText: 'Why would you click this?' });

      expect(ratioLock.$view.find('.js-ratio-lock-label')).toContainText('Why would you click this?');
      ratioLock.destroy();
    });
  });

  describe('#disable', function() {
    it('adds a disabled class to the lock container', function() {
      this.ratioLock.disable();
      expect(this.$el.find('.js-ratio-controls')).toHaveClass('disabled');
    });

    it('disables the lock checkbox', function() {
      this.ratioLock.disable();
      expect(this.$el.find('.js-ratio-lock')).toBeDisabled();
    });
  });

  describe('#enable', function() {
    beforeEach(function() {
      this.ratioLock.disable();
    });

    it('adds a disabled class to the lock container', function() {
      this.ratioLock.enable();
      expect(this.$el.find('.js-ratio-controls')).not.toHaveClass('disabled');
    });

    it('disables the lock checkbox', function() {
      this.ratioLock.enable();
      expect(this.$el.find('.js-ratio-lock')).not.toBeDisabled();
    });
  });
});
