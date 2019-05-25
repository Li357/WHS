import {
  ScheduleItem, ClassItem, CrossSectionedItem, CrossSectionedColumn,
  RawSchedule, UserDaySchedule,
} from '../types/schedule';
import { sortByProps, insert, getWithFallback } from './array';

/**
 * Generates a simple but unique sourceId for an open mod or cross-sectioned item
 * @param startMod start mod of the item whose sourceId is being generated
 * @param endMod end mod of the item
 * @param day day of the item
 */
function generateSourceId(startMod: number, endMod: number, day: number) {
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
function createCrossSectionedItem(
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
function createOpenItem(startMod: number, endMod: number, day: number): ClassItem {
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
 */
function interpolateCrossSectionedItems(userDaySchedule: ClassItem[], day: number): UserDaySchedule {
  let transformed: ScheduleItem[] = [...userDaySchedule];
  let currentBlockStartMod = -1; // Since homeroom starts at 0
  let currentBlockEndMod = -1;
  let currentBlockColumns: CrossSectionedColumn[] = [];

  for (let index = 0; index < userDaySchedule.length; index++) {
    const [prev, current, next] = userDaySchedule.slice(index - 1, index + 2);

    const isPreviousOverlapping = prev !== undefined && prev.endMod > current.startMod;
    const isNextOverlapping = next !== undefined && current.endMod > next.startMod;
    if (isPreviousOverlapping || isNextOverlapping) {
      if (currentBlockEndMod < current.startMod) {
        const crossSectionedItem = createCrossSectionedItem(
          currentBlockColumns, currentBlockStartMod, currentBlockEndMod, day,
        );
        transformed = insert(transformed, [crossSectionedItem], index);

        currentBlockStartMod = current.startMod;
        currentBlockColumns = [];
      } else {
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
  }
  return transformed;
}

/**
 * Interpolates open mods to a certain day's schedule
 * @param userDaySchedule schedule to interpolate with open mods
 * @param day day of the current schedule
 */
function interpolateOpenItems(userDaySchedule: UserDaySchedule, day: number): UserDaySchedule {
  let transformed = [...userDaySchedule];
  let index = 0;
  do { // Guaranteed iteration adds open mod to empty schedules
    const currentEndMod = getWithFallback(userDaySchedule[index], ['endMod'], 0);
    const nextStartMod = getWithFallback(userDaySchedule[index + 1], ['startMod'], 15);

    if (currentEndMod < nextStartMod) {
      transformed = insert(transformed, [createOpenItem(currentEndMod, nextStartMod, day)], index);
    }
    index++;
  } while (index < userDaySchedule.length);
  return transformed;
}

/**
 * Transforms array of schedule items into full schedule with open mods and cross-sectioned blocks
 * @param rawSchedule raw schedule as fetched from WHS scheduler website
 */
export function processSchedule(rawSchedule: RawSchedule) {
  return rawSchedule
    .reduce((userDaySchedules: ClassItem[][], classItem) => {
      userDaySchedules[classItem.day - 1].push(classItem);
      return userDaySchedules;
    }, [[], [], [], [], []])
    .map((userDaySchedule, index) => {
      const scheduleDay = index + 1;
      const sorted = sortByProps(userDaySchedule, ['startMod', 'length']);
      const withCrossSections = interpolateCrossSectionedItems(sorted, scheduleDay);
      return interpolateOpenItems(withCrossSections, scheduleDay);
    });
}
