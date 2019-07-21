import {
  ScheduleItem, ClassItem, CrossSectionedItem, CrossSectionedColumn,
  RawSchedule, UserDaySchedule, RawClassItem, ModNumber,
} from '../types/schedule';
import { sortByProps, insert, getWithFallback, splice } from './object';
import { getModNameFromModNumber, getOccupiedMods } from './query-schedule';
import * as SCHEDULES from '../constants/schedules';

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
 * Creates a basic non-specific schedule item
 * @param startMod startMod of the schedule item
 * @param endMod endMod of the item
 * @param day day of the item
 */
function createScheduleItem(startMod: number, endMod: number, day: number) {
  const length = endMod - startMod;
  const sourceId = generateSourceId(startMod, endMod, day);
  return { sourceId, startMod, endMod, length, day };
}

/**
 * creates a ClassItem
 * @param title title of the item
 * @param body body of the item
 * @param startMod startMod of the item
 * @param endMod endMod of the item
 * @param day day of the item
 * @param sourceType sourceType of the item
 */
export function createClassItem(
  title: string, body: string, startMod: number, endMod: number, day: number, sourceType: string,
): ClassItem {
  return { ...createScheduleItem(startMod, endMod, day), title, body, sourceType };
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
  return { ...createScheduleItem(startMod, endMod, day), columns };
}

/**
 * Constructs an open mod class item
 * @param startMod start mod of the open mod
 * @param endMod end mod of the open mod
 * @param day day of the open mod
 */
export function createOpenItem(startMod: number, endMod: number, day: number): ClassItem {
  return createClassItem('Open Mod', '', startMod, endMod, day, 'open');
}

/**
 * Converts a raw item from website to class item
 * @param rawItem raw schedule item to convert to class item
 */
export function convertToClassItem({
  title, body, startMod, endMod, day, sourceType,
}: RawClassItem): ClassItem {
  return createClassItem(title, body, startMod, endMod, day, sourceType);
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
 * Splits a class item down given index into two halves
 * @param classItem to split
 * @param modNumber modNumber to split the item
 */
function splitClassItem({ title, body, startMod, endMod, day, sourceType }: ClassItem, modNumber: ModNumber) {
  const firstHalf = createClassItem(title, body, startMod, modNumber, day, sourceType);
  const secondHalf = createClassItem(title, body, modNumber + 1, endMod, day, sourceType);
  return [firstHalf, secondHalf];
}

/**
 * Injects an assembly mod into the user's schedule for the day
 * @param userDaySchedule user's schedule for the day
 * @param day to interpolate assembly on
 */
export function interpolateAssembly(userDaySchedule: UserDaySchedule, day: number): UserDaySchedule {
  const assemblyMod = SCHEDULES.ASSEMBLY.findIndex((triplet) => triplet[2] === ModNumber.ASSEMBLY)!;
  const itemIndex = userDaySchedule.findIndex((scheduleItem) => (
    getOccupiedMods(scheduleItem).includes(assemblyMod)
  ));
  const itemDuringAssembly = userDaySchedule[itemIndex];

  const assemblyItem = createClassItem('Assembly', '', ModNumber.ASSEMBLY, ModNumber.FOUR, day, 'assembly');
  // The assembly item will be cutting through an cross sectioned item
  if (itemDuringAssembly.hasOwnProperty('columns')) {
    const crossSectionedItem = itemDuringAssembly as CrossSectionedItem;
    const [firstColumns, secondColumns] = crossSectionedItem.columns.reduce((
      [first, second]: [CrossSectionedColumn[], CrossSectionedColumn[]],
      column,
      ) => {
      const splitIndex = column.findIndex(({ startMod, endMod }) => endMod > ModNumber.ASSEMBLY);
      const columnItem = column[splitIndex];
      // mod in column traverses assembly
      if (columnItem.startMod < ModNumber.ASSEMBLY) {
        const [firstHalf, secondHalf] = splitClassItem(columnItem, ModNumber.ASSEMBLY);
        first.push([...column.slice(0, splitIndex), firstHalf]);
        second.push([secondHalf, ...column.slice(splitIndex + 1)]);
      } else {
        first.push(column.slice(0, splitIndex));
        second.push(column.slice(splitIndex));
      }
      return [first, second];
    }, [[], []]);

    const firstCrossSection = createCrossSectionedItem(
      firstColumns, crossSectionedItem.startMod, ModNumber.ASSEMBLY, day,
    );
    const secondCrossSection = createCrossSectionedItem(
      secondColumns, ModNumber.ASSEMBLY, crossSectionedItem.endMod, day,
    );
    return splice(userDaySchedule, itemIndex, 2, [firstCrossSection, assemblyItem, secondCrossSection]);
  }

  // assembly cuts through a single length > 1 mod
  if (itemDuringAssembly.length > 1) {
    const [firstHalf, secondHalf] = splitClassItem(itemDuringAssembly as ClassItem, ModNumber.ASSEMBLY);
    return splice(userDaySchedule, itemIndex, 1, [firstHalf, assemblyItem, secondHalf]);
  }
  // no cuts
  return insert(userDaySchedule, [assemblyItem], itemIndex);
}

/**
 * Returns a day's user schedule for a finals day
 * @param userDaySchedule user's schedule for a specific day
 * @param day to get finals schedule on
 */
export function getFinalsSchedule(userDaySchedule: UserDaySchedule, day: number): UserDaySchedule {
  const fallBackHomeroom = createClassItem('Homeroom', '', ModNumber.HOMEROOM, ModNumber.ONE, day, 'homeroom');
  const [homeroom = fallBackHomeroom] = userDaySchedule;
  const finals = Array(4).fill(undefined).map((_, i) => {
    const startMod = ModNumber.FINALS_ONE + i;
    return createClassItem(getModNameFromModNumber(startMod), '', startMod, startMod + 1, homeroom.day, 'finals');
  });
  return [homeroom, ...finals];
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
