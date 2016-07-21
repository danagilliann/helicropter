import $ from 'jquery';
import SuggestionArea from 'SuggestionArea';

function createSuggestionArea($el, data = {}) {
  const suggestionArea = new SuggestionArea(data);
  suggestionArea.render($el);
  return suggestionArea;
}

describe('SuggestionArea', function() {
  beforeEach(function() {
    this.$el = affix('.js-suggestion-area-parent');
    this.suggestionArea = createSuggestionArea(this.$el);
  });

  afterEach(function() {
    this.suggestionArea.destroy();
  });

  it('renders', function() {
    expect(this.$el.find('.js-suggestion-list')).toExist();
  });

  it('defaults to showing no suggestions', function() {
    expect(this.$el.find('.js-suggestion-item').length).toBe(0);
  });

  it('pads suggestions to max suggestion if given less than the max suggestion', function() {
    const suggestionArea = createSuggestionArea(this.$el, {
      suggestions: [
        { src: 'blob:foo', url: 'http://path/to/foo' },
        { src: 'blob:bar', url: 'http://path/to/bar' },
        { src: 'blob:baz', url: 'http://path/to/baz' }
      ]
    });
    suggestionArea.render(this.$el);

    expect(suggestionArea.$view.find('.js-suggestion-item:not(.empty)').length).toBe(3);
    expect(suggestionArea.$view.find('.js-suggestion-item.empty').length).toBe(4);
  });

  describe('"image-loaded" event', function() {
    describe('when there are no suggestions', function() {
      it('shows the suggestion area and adds the new image as the first suggestion', function() {
        expect(this.$el.find('.js-suggestion-item').length).toBe(0);

        this.suggestionArea.trigger('image-uploaded', {
          src: 'newimage',
          url: 'newimage.fake.com'
        });

        const firstSuggestion = this.$el.find('.js-suggestion-item:first');

        expect(firstSuggestion.data('src')).toBe('newimage');
        expect(firstSuggestion.data('url')).toBe('newimage.fake.com');
      });
    });

    describe('when there are existing suggestions', function() {
      beforeEach(function() {
        this.$el.empty();

        this.suggestionArea = createSuggestionArea(this.$el, {
          suggestions: [
            { src: 'blob:foo', url: 'http://path/to/foo' },
            { src: 'blob:bar', url: 'http://path/to/bar' },
            { src: 'blob:baz', url: 'http://path/to/baz' }
          ]
        });
        this.suggestionArea.render(this.$el);
      });

      it('adds the new image as the first suggestion item', function() {
        expect(this.$el.find('.js-suggestion-item:not(.empty)').length).toBe(3);
        expect(this.$el.find('.js-suggestion-item').length).toBe(7);

        this.suggestionArea.trigger('image-uploaded', {
          src: 'newimage',
          url: 'newimage.fake.com'
        });

        const firstSuggestion = $(this.$el.find('.js-suggestion-item')[0]);
        const secondSuggestion = $(this.$el.find('.js-suggestion-item')[1]);

        expect(firstSuggestion.data('src')).toBe('newimage');
        expect(firstSuggestion.data('url')).toBe('newimage.fake.com');

        expect(secondSuggestion.data('src')).toBe('blob:foo');
        expect(secondSuggestion.data('url')).toBe('http://path/to/foo');

        expect(this.$el.find('.js-suggestion-item:not(.empty)').length).toBe(4);
        expect(this.$el.find('.js-suggestion-item').length).toBe(7);
      });
    });

    describe('when there are the max existing suggestions', function() {
      beforeEach(function() {
        this.$el.empty();

        this.suggestionArea = createSuggestionArea(this.$el, {
          suggestions: [
            { src: 'blob:1', url: 'http://path/to/1' },
            { src: 'blob:2', url: 'http://path/to/2' },
            { src: 'blob:3', url: 'http://path/to/3' },
            { src: 'blob:4', url: 'http://path/to/4' },
            { src: 'blob:5', url: 'http://path/to/5' },
            { src: 'blob:6', url: 'http://path/to/6' },
            { src: 'blob:7', url: 'http://path/to/7' }
          ]
        });
        this.suggestionArea.render(this.$el);
      });

      it('truncates the list to the max length', function() {
        expect(this.$el.find('.js-suggestion-item:not(.empty)').length).toBe(7);
        expect(this.$el.find('.js-suggestion-item').length).toBe(7);

        this.suggestionArea.trigger('image-uploaded', {
          src: 'newimage',
          url: 'newimage.fake.com'
        });

        const firstSuggestion = $(this.$el.find('.js-suggestion-item')[0]);
        const secondSuggestion = $(this.$el.find('.js-suggestion-item')[1]);
        const lastSuggestion = $(this.$el.find('.js-suggestion-item')[6]);

        expect(firstSuggestion.data('src')).toBe('newimage');
        expect(firstSuggestion.data('url')).toBe('newimage.fake.com');

        expect(secondSuggestion.data('src')).toBe('blob:1');
        expect(secondSuggestion.data('url')).toBe('http://path/to/1');

        expect(lastSuggestion.data('src')).toBe('blob:6');
        expect(lastSuggestion.data('url')).toBe('http://path/to/6');

        expect(this.$el.find('.js-suggestion-item:not(.empty)').length).toBe(7);
        expect(this.$el.find('.js-suggestion-item').length).toBe(7);
      });
    });
  });
});
