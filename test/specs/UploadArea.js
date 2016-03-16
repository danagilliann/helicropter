import $ from 'jquery';
import extend from 'nbd/util/extend';
import UploadArea from 'UploadArea';
import config from '../fixtures/config';

describe('UploadArea', function() {
  beforeEach(function() {
    setFixtures('');

    this.options = {
      uploaderOptions: config.uploaderOptions,
      backgroundImage: config.uploadBackgroundImage,
      width: config.canvasSize.width,
      height: config.canvasSize.height,
      titleText: config.uploadTitle,
      subtitleText: config.uploadSubtitle
    };

    this.create = (customOptions) => {
      const inst = new UploadArea(extend(this.options, customOptions));
      inst.render($('#jasmine-fixtures'));
      return inst;
    };
  });

  afterEach(function() {
    this.uploadArea.destroy();
  });

  it('supplies a default title', function() {
    expect(this.options.titleText).not.toBeDefined();

    this.uploadArea = this.create();

    expect($('.image-upload-text')).toHaveText('Upload Image');
  });

  it('allows for a custom title', function() {
    this.uploadArea = this.create({
      titleText: 'foobar'
    });

    expect($('.js-image-upload-text')).toHaveText('foobar');
  });

  it('allows for a nullified title', function() {
    this.uploadArea = this.create({
      titleText: ''
    });

    expect($('.js-image-upload-text')).toHaveText('');
  });

  it('does not supply a default subtitle', function() {
    expect(this.options.subtitleText).not.toBeDefined();

    this.uploadArea = this.create();

    expect($('.js-image-upload-subtext')).toHaveText('');
  });

  it('allows for a custom subtitle', function() {
    this.uploadArea = this.create({
      subtitleText: 'foobar'
    });

    expect($('.js-image-upload-subtext')).toHaveText('foobar');
  });
});
