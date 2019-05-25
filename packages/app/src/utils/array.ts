/**
 * Inserts items into an array without mutation
 * @param arr array to insert items into
 * @param items items to insert
 * @param index index to insert at
 * @throws RangeError if specified index is not in interval [0, arr.length]
 */
export function insert<T>(arr: T[], items: T[], index: number) {
  if (index > arr.length || index < 0) {
    throw new RangeError('Array index out of range!');
  }

  return [...arr.slice(0, index), ...items, ...arr.slice(index)];
}

/**
 * Sorts an array based on provided keys (left-to-right)
 * @param arr array to be sorted
 * @param props list of props to sort by, left is higher-precedence
 */
export function sortByProps<T extends object>(arr: T[], props: Array<keyof T>) {
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
export function getWithFallback<T>(obj: any, path: string[], fallback: T) {
  let currObj = obj;
  for (const key of path) {
    if (currObj === undefined) {
      return fallback;
    }
    currObj = currObj[key];
  }
  return currObj !== undefined ? currObj : fallback;
}
