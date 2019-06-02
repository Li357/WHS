import {
  ScheduleItem, ClassItem, CrossSectionedItem, CrossSectionedColumn,
  RawSchedule, UserDaySchedule, RawClassItem,
} from '../types/schedule';
import { sortByProps, insert, getWithFallback, splice, excludeKeys } from './object';
import { SCHEDULE_RESTRICTED_KEYS } from '../constants/fetch';

/**
 * Generates a simple but unique sourceId for an open mod or cross-sectioned item
 * @param startMod start mod of the item whose sourceId is being generated
 * @param endMod end mod of the item
 * @param day day of the item
 */
export function generateSourceId(startMod: number, endMod: number, day: number) {
  const paddedStart = String(startMod).padStart(2, '0');
  const paddedEnd = String(endMod).padStart(2, '0');
  // Extra zeros ensure it is out the range of actual class sourceIds
  return Number(`${day}${paddedStart}${paddedEnd}000`);
}

/**
 * Constructs a cross-sectioned item
 * @param columns columns of cross-sectioned item
 * @param startMod start mod of the item
 * @param endMod end mod of the item
 * @param day  day of the item
 */
export function createCrossSectionedItem(
  columns: CrossSectionedColumn[], startMod: number, endMod: number, day: number,
): CrossSectionedItem {
  return {
    sourceId: generateSourceId(startMod, endMod, day),
    columns,
    day,
    startMod,
    length: endMod - startMod,
    endMod,
  };
}

/**
 * Constructs an open mod
 * @param startMod start mod of the open mod
 * @param endMod end mod of the open mod
 * @param day day of the open mod
 */
export function createOpenItem(startMod: number, endMod: number, day: number): ClassItem {
  return {
    sourceId: generateSourceId(startMod, endMod, day),
    sourceType: 'open',
    title: 'Open Mod',
    body: '',
    roomNumber: '',
    day,
    startMod,
    length: endMod - startMod,
    endMod,
  };
}

/**
 * Interpolates cross-sectioned blocks to a certain day's schedule. Splits cross
 * sectioned mods into blocks of overlapping mods, then distributes them into columns
 * @param userDaySchedule schedule to interpolate with cross-sectioned items
 * @param day day of the user schedule
 */
export function interpolateCrossSectionedItems(userDaySchedule: ClassItem[], day: number): UserDaySchedule {
  let transformed: ScheduleItem[] = [...userDaySchedule];
  let currentBlockStartMod = -1; // Since homeroom starts at 0
  let currentBlockEndMod = -1;
  let currentBlockStartIndex = -1;
  let currentBlockSize = 0;
  let currentBlockColumns: CrossSectionedColumn[] = [];
  let indexShift = 0; // once a splice occurs, the index in transformed is not the same as in userDaySchedule

  for (let index = 0; index < userDaySchedule.length; index++) {
    const prev = userDaySchedule[index - 1];
    const current = userDaySchedule[index];
    const next = userDaySchedule[index + 1];

    const isPreviousOverlapping = prev !== undefined && prev.endMod > current.startMod;
    const isNextOverlapping = next !== undefined && current.endMod > next.startMod;
    if (isPreviousOverlapping || isNextOverlapping) { // if we have a cross-section
      const isNewBlock = currentBlockEndMod <= current.startMod;
      if (isNewBlock) {
        if (currentBlockColumns.length > 0) { // if we've already appended to columns, i.e. not first block in day
          const crossSectionedItem = createCrossSectionedItem(
            currentBlockColumns, currentBlockStartMod, currentBlockEndMod, day,
          );
          transformed = splice(transformed, currentBlockStartIndex, currentBlockSize, [crossSectionedItem]);
          indexShift += currentBlockSize - 1;  // once a splice occurs, now offset by previous block size - 1 indices
        }

        currentBlockStartIndex = index - indexShift;
        currentBlockSize = 1;
        currentBlockColumns = [[current]];
        currentBlockStartMod = current.startMod;
      } else {
        currentBlockSize++;

        const availableColumn = currentBlockColumns.findIndex((column) => (
          column.some((scheduleItem) => current.startMod >= scheduleItem.endMod)
        ));
        if (availableColumn > -1) {
          currentBlockColumns[availableColumn].push(current);
        } else {
          currentBlockColumns.push([current]);
        }
      }
      currentBlockEndMod = current.endMod;
    }
    if (index === userDaySchedule.length - 1 && currentBlockColumns.length > 0) {
      // Once we've iterated through the entire schedule, splice any remaining blocks as items to schedule
      const crossSectionedItem = createCrossSectionedItem(
        currentBlockColumns, currentBlockStartMod, currentBlockEndMod, day,
      );
      return splice(transformed, currentBlockStartIndex, currentBlockSize, [crossSectionedItem]);
    }
  }
  return transformed;
}

/**
 * Interpolates open mods to a certain day's schedule
 * @param userDaySchedule schedule to interpolate with open mods
 * @param day day of the current schedule
 */
export function interpolateOpenItems(userDaySchedule: UserDaySchedule, day: number): UserDaySchedule {
  let transformed = [...userDaySchedule];
  let index = 0;
  let indexShift = 0; // every insert shifts indices by one to the right

  while (index <= userDaySchedule.length) {
    const prevEndMod = getWithFallback(userDaySchedule[index - 1], ['endMod'], 0);
    const currentStartMod = getWithFallback(userDaySchedule[index], ['startMod'], 15);

    if (prevEndMod < currentStartMod) {
      transformed = insert(transformed, [createOpenItem(prevEndMod, currentStartMod, day)], index + indexShift);
      indexShift++;
    }
    index++;
  }
  return transformed;
}

/**
 * Converts a raw item from website to class item
 * @param rawItem raw schedule item to convert to class item
 */
export function convertToClassItem(rawItem: RawClassItem): ClassItem {
  return excludeKeys(rawItem, SCHEDULE_RESTRICTED_KEYS);
}

/**
 * Transforms array of schedule items into full schedule with open mods and cross-sectioned blocks
 * @param rawSchedule raw schedule as fetched from WHS scheduler website
 */
export function processSchedule(rawSchedule: RawSchedule) {
  return rawSchedule
    .reduce((userDaySchedules: ClassItem[][], rawItem) => {
      userDaySchedules[rawItem.day - 1].push(convertToClassItem(rawItem));
      return userDaySchedules;
    }, [[], [], [], [], []])
    .map((userDaySchedule, index) => {
      const scheduleDay = index + 1;
      const sorted = sortByProps(userDaySchedule, ['startMod', 'length']);
      const withCrossSections = interpolateCrossSectionedItems(sorted, scheduleDay);
      return interpolateOpenItems(withCrossSections, scheduleDay);
    });
}
