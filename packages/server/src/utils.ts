export function getCookie(name: string) {
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  if (match) {
    return match[2] !== undefined ? match[2] : null;
  }
  return null;
}

export function range(start: number, end: number) {
  return Array(end - start).fill(undefined).map((_, i) => i + start);
}
