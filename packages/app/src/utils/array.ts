/**
 * Inserts items into an array without mutation
 * @param arr array to insert items into
 * @param items items to insert
 * @param index index to insert at
 */
export function insert<T>(arr: T[], items: T[], index: number) {
  return [...arr.slice(0, index), ...items, ...arr.slice(index)];
}

/**
 * Sorts an array based on provided keys (left-to-right)
 * @param arr array to be sorted
 * @param props list of props to sort by, left is higher-precedence
 */
export function sortByProps<T>(arr: T[], props: Array<keyof T>) {
  const shallowCopy = [...arr];
  return shallowCopy.sort((a, b) => {
    for (const prop of props) {
      if (a[prop] !== b[prop]) {
        return a[prop] > b[prop] ? 1 : -1;
      }
    }
    return 0;
  });
}

/**
 * Gets a value deep inside object, returning a fallback when failing
 * @param obj object to get property from
 * @param path key hierarchy to get
 * @param fallback default value if undefined encountered along the way
 */
export function getWithFallback<T>(obj: { [key: string]: any }, path: string[], fallback: T) {
  let deepValue = fallback;
  let currObj = obj;
  for (const key of path) {
    const value: any = currObj[key];
    if (value === undefined) {
      return deepValue;
    }
    currObj = value;
    deepValue = value;
  }
  return deepValue;
}
