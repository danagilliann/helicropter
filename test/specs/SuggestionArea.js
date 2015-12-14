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

  it('defaults to showing seven empty suggestions', function() {
    expect(this.$el.find('.js-suggestion-item').length).toBe(7);
  });

  it('pads suggestions to seven if given less than seven', function() {
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
});
