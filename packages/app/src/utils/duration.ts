// https://github.com/date-fns/date-fns/issues/284

/**
 * Formats a duration of time in seconds to hh:*mm:ss
 * @param durationInSeconds duration to format in seconds
 */
export function formatDuration(durationInSeconds: number) {
  const hours = durationInSeconds / 3600;
  const fullHours = Math.floor(hours);
  const hasFullHours = fullHours > 0;

  const minutes = (hours - Math.floor(hours)) * 60;
  const fullMinutes = Math.floor(minutes);
  const displayMinutes = fullMinutes.toString().padStart(hasFullHours ? 2 : 1, '0');

  const seconds = (minutes - Math.floor(minutes)) * 60;
  const displaySeconds = Math.floor(seconds).toString().padStart(2, '0');

  return `${hasFullHours ? `${fullHours}:` : ''}${displayMinutes}:${displaySeconds}`;
}
