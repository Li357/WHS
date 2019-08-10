import { formatDuration, formatTime } from '../../src/utils/duration';

describe('duration utils', () => {
  describe('formatDuration', () => {
    it('returns correctly for m:ss', () => {
      expect(formatDuration(0)).toBe('0:00');
      expect(formatDuration(599)).toBe('9:59');
    });

    it('returns correctly for mm:ss', () => {
      expect(formatDuration(600)).toBe('10:00');
      expect(formatDuration(3599)).toBe('59:59');
    });

    it('returns correctly for h:mm:ss', () => {
      expect(formatDuration(3600)).toBe('1:00:00');
      expect(formatDuration(35999)).toBe('9:59:59');
    });

    it('returns correctly for hh:mm:ss', () => {
      expect(formatDuration(36000)).toBe('10:00:00');
      expect(formatDuration(360000)).toBe('100:00:00');
    });

    it('doesn\'t skip a second due to rounding errors', () => {
      expect(formatDuration(28024)).toBe('7:47:04');
      expect(formatDuration(28023)).toBe('7:47:03');
    });
  });

  describe('formatTime', () => {
    it('formats hours <= 12', () => {
      expect(formatTime('12:50')).toBe('12:50');
      expect(formatTime('3:23')).toBe('3:23');
    });

    it('formats hours > 12', () => {
      expect(formatTime('13:50')).toBe('1:50');
      expect(formatTime('23:25')).toBe('11:25');
      expect(formatTime('24:34')).toBe('12:34');
    });
  });
});
