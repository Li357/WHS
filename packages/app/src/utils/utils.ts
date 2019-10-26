import { Alert } from 'react-native';
import { subDays, format } from 'date-fns';
import fetchPolyfill from 'react-native-fetch-polyfill';
import debounce from 'lodash.debounce';

import client from './bugsnag';
import { NetworkError, LoginError } from './error';
import {
  ERROR, CAUTION,
  LOGIN_CREDENTIALS_CHANGED_MSG, NETWORK_REQUEST_FAILED_MSG, UNKNOWN_ERROR_MSG, NO_SPACE_MSG,
} from '../constants/fetch';

/**
 * Split array without mutation
 * @param arr array to be spliced
 * @param start index to start cutting at
 * @param deleteCount amount of items to cut
 * @param items items to insert in place of cut
 * @throws RangeError if specified start is not in interval [0, arr.length)
 */
export function splice<T>(arr: T[], start: number, deleteCount: number, items: T[] = []) {
  if (start > arr.length - 1 || start < 0) {
    throw new RangeError('Array index out of range!');
  }
  return [...arr.slice(0, start), ...items, ...arr.slice(start + deleteCount)];
}

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

/**
 * Returns sum of items in array
 * @param arr array to be summed
 */
export function sum(arr: number[]) {
  return arr.reduce((a, b) => a + b, 0);
}

/**
 * Gets last item of array
 * @param arr array to get last item of
 */
export function last<T>(arr: T[]) {
  return arr.slice(-1)[0];
}

/**
 * Same signature as WHATWG fetch but rethrows TypeError as NetworkError for catching
 */
export async function fetch(input?: string | Request, init?: RequestInit & Timeout): Promise<Response> {
  try {
    const response = await fetchPolyfill(input, init);
    return response;
  } catch (error) {
    if (error instanceof TypeError) {
      throw new NetworkError();
    }
    throw error;
  }
}

export function notify(title: string, body: string) {
  Alert.alert(title, body, [{ text: 'OK' }]);
}

export const reportError = debounce((error: Error, customMessage?: string) => {
  if (error instanceof LoginError) {
    return notify(ERROR, LOGIN_CREDENTIALS_CHANGED_MSG);
  } else if (error instanceof NetworkError) {
    return notify(ERROR, NETWORK_REQUEST_FAILED_MSG);
  }
  notify(ERROR, customMessage || UNKNOWN_ERROR_MSG);
  client.notify(error);
}, 5000, { leading: true });

export function reportScheduleCaution(semesterOneStart: Date) {
  // On the server-side, semesterOneStart represents the day everyone goes to school
  // 1 day before is freshmen orientation day
  // 2 days before is when schedules are final
  const schedulesFinalDate = format(subDays(semesterOneStart, 2), 'MMMM do');
  // day where everyone goes to school
  const firstDate = format(semesterOneStart, 'MMMM do');

  notify(
    CAUTION,
    `Many schedules are changing and will not be considered final until ${schedulesFinalDate}. `
    + `Please be sure to refresh your schedule so that you attend the correct classes starting ${firstDate}.`,
  );
}

export function reportNotEnoughSpace() {
  notify(ERROR, NO_SPACE_MSG);
}
