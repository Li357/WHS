// https://github.com/date-fns/date-fns/issues/284

/**
 * Formats a duration of time in seconds to hh:*mm:ss
 * @param durationInSeconds duration to format in seconds
 */
export function formatDuration(durationInSeconds: number) {
  const hours = Math.floor(durationInSeconds / 3600);
  const hasHours = hours > 0;

  const minutes = Math.floor((durationInSeconds % 3600) / 60);
  const displayMinutes = minutes.toString().padStart(hasHours ? 2 : 1, '0');

  const seconds = durationInSeconds % 60;
  const displaySeconds = Math.floor(seconds).toString().padStart(2, '0');

  return `${hasHours ? `${hours}:` : ''}${displayMinutes}:${displaySeconds}`;
}

/**
 * Formats a 24-hour time in hh:mm to 12-hour time
 * @param militaryTime time to format
 */
export function formatTime(militaryTime: string) {
  const [militaryHours, militaryMinutes] = militaryTime.split(':');
  const remainder = Number(militaryHours) % 12;
  return `${remainder === 0 ? 12 : remainder}:${militaryMinutes}`;
}
