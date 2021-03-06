import { fetch, insert, sortByProps, getWithFallback, splice, sum, last, reportError } from '../../src/utils/utils';
import client from '../../src/utils/bugsnag';
import { LoginError, NetworkError } from '../../src/utils/error';
import { fetchMock } from '../test-utils/fetch';

fetchMock.config.fetch = fetch;
fetchMock
  .get('/', new Promise((res) => setTimeout(res, 1000)));

describe('array utils', () => {
  describe('splice', () => {
    it('should not mutate input', () => {
      const input = ['a'];
      splice(input, 0, 1);
      expect(input).not.toEqual([]);
    });

    it('should delete at specified index', () => {
      expect(splice(['a', 'b'], 1, 1)).toEqual(['a']);
    });

    it('should handle start + deleteCount beyond length', () => {
      expect(splice(['a', 'b'], 1, 2)).toEqual(['a']);
    });

    it('should insert items at deleted index', () => {
      expect(splice(['a', 'b'], 1, 1, ['c'])).toEqual(['a', 'c']);
    });

    it('should throw if start out of range', () => {
      expect(() => splice(['a'], 1, 1)).toThrowError(RangeError);
      expect(() => splice(['a'], -1, 1)).toThrowError(RangeError);
    });
  });

  describe('insert', () => {
    it('should not mutate input', () => {
      const input: string[] = [];
      insert(input, ['a'], 0);
      expect(input).not.toEqual(['a']);
    });

    it('should insert at index', () => {
      expect(insert(['a'], ['a'], 1)).toEqual(['a', 'a']);
    });

    it('should handle empty array', () => {
      expect(insert([], ['a'], 0)).toEqual(['a']);
    });

    it('should throw if index out of range', () => {
      expect(() => insert([], ['a'], 1)).toThrowError(RangeError);
      expect(() => insert([], ['a'], -1)).toThrowError(RangeError);
    });
  });

  describe('sortByProps', () => {
    const input = [
      { foo: 2, bar: 3 },
      { foo: 2, bar: 2 },
      { foo: 1, bar: 2 },
      { foo: 3, bar: 1 },
    ];
    const sortedByFoo = [
      { foo: 1, bar: 2 },
      { foo: 2, bar: 3 },
      { foo: 2, bar: 2 },
      { foo: 3, bar: 1 },
    ];

    it('should not mutate input', () => {
      sortByProps(input, ['foo']);
      expect(input).not.toEqual(sortedByFoo);
    });

    it('should sort array by props', () => {
      const sortedByBar = [
        { foo: 3, bar: 1 },
        { foo: 2, bar: 2 },
        { foo: 1, bar: 2 },
        { foo: 2, bar: 3 },
      ];
      expect(sortByProps(input, ['foo'])).toEqual(sortedByFoo);
      expect(sortByProps(input, ['bar'])).toEqual(sortedByBar);
    });

    it('should sort props left-to-right', () => {
      expect(sortByProps(input, ['foo', 'bar'])).toEqual([
        { foo: 1, bar: 2 },
        { foo: 2, bar: 2 },
        { foo: 2, bar: 3 },
        { foo: 3, bar: 1 },
      ]);
      expect(sortByProps(input, ['bar', 'foo'])).toEqual([
        { foo: 3, bar: 1 },
        { foo: 1, bar: 2 },
        { foo: 2, bar: 2 },
        { foo: 2, bar: 3 },
      ]);
    });

    it('should handle non-numeric types', () => {
      const nonNumeric = [
        { foo: 'b' },
        { foo: 'a' },
      ];
      expect(sortByProps(nonNumeric, ['foo'])).toEqual([
        { foo: 'a' },
        { foo: 'b' },
      ]);
    });
  });

  describe('getWithFallback', () => {
    const obj = {
      a: {
        c: undefined,
        d: { e: 5 },
      },
    };

    it('should get specified path', () => {
      expect(getWithFallback(obj, ['a', 'd', 'e'], 0)).toEqual(5);
      expect(getWithFallback(obj, [], 0)).toEqual(obj);
    });

    it('should handle undefined as object', () => {
      expect(getWithFallback(undefined, ['a'], 0)).toEqual(0);
      expect(getWithFallback(undefined, [], 0)).toEqual(0);
    });

    it('should return fallback if it fails', () => {
      expect(getWithFallback(obj, ['b'], 0)).toEqual(0);
      expect(getWithFallback(obj, ['a', 'c'], 0)).toEqual(0);
      expect(getWithFallback(obj, ['a', 'b'], 0)).toEqual(0);
      expect(getWithFallback(obj, ['a', 'b', 'c', 'd'], 0)).toEqual(0);
    });
  });

  describe('sum', () => {
    it('should sum the array', () => {
      expect(sum([])).toBe(0);
      expect(sum([0, 1, 3])).toBe(4);
    });
  });

  describe('last', () => {
    it('should handle empty array', () => {
      expect(last([])).toBe(undefined);
    });

    it('should return last item', () => {
      expect(last([1, 2])).toBe(2);
    });
  });

  describe('custom fetch', () => {
    it('should throw NetworkError instead of TypeError', async () => {
      await expect(fetch('/', { timeout: 500 })).rejects.toThrowError(NetworkError);
    });
  });

  describe('reportError', () => {
    const bugsnagNotify = client.notify as jest.Mock<void, [Error]>;

    it('should not report login and network errors to bugsnag', () => {
      reportError(new LoginError());
      expect(bugsnagNotify).not.toBeCalled();

      reportError(new NetworkError());
      expect(bugsnagNotify).not.toBeCalled();
    });

    it('should notify bugsnag otherwise', () => {
      const error = new Error('Test Error');
      reportError(error);
      expect(bugsnagNotify.mock.calls[0]).toEqual([error]);
    });
  });
});
