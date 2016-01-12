import Helicropter from 'index';

describe('Helicropter', function() {
  describe('#crop', function() {
    describe('when cropping area does not have crop data', function() {
      beforeEach(function() {
        this._helicropter = new Helicropter({
          uploaderOptions: {
            request: {
              endpoint: 'foo',
              accessKey: 'foo'
            },
            signature: {
              endpoint: '/s3handler'
            }
          },
          initialImage: {
            src: '/imgs/test-kitten.jpeg',
            url: 'https://foo.com/imgs/test-kitten.jpeg'
          }
        });

        this._helicropter.render(this.$el);
      });

      it('returns undefined', function() {
        spyOn(this._helicropter._view._croppingArea, 'getCropData').and.returnValue(undefined);
        expect(this._helicropter.crop()).not.toBeDefined();
      });
    });
  });
});
