import {
  isAfter,
  isBefore,
  toDate,
  isWithinInterval,
  isSameDay,
  subDays,
  differenceInSeconds,
  differenceInCalendarWeeks,
} from 'date-fns';
import { ELearningPlanSchema } from '@whs/server';

import {
  DaySchedule,
  ModNumber,
  Schedule,
  ScheduleInfo,
  UserDaySchedule,
  ScheduleItem,
  ClassItem,
} from '../types/schedule';
import { DatesState, DayScheduleType, ELearningPlansState } from '../types/store';
import { last } from './utils';

/**
 * Converts a `h:mm` time (from a day schedule timpair) to a date for comparison
 * @param time `h:mm` time string to convert to date (i.e. `8:00`)
 * @param date current day to construct day from to ensure only time comparison
 */
export function convertTimeToDate(time: string, date: Date = new Date()) {
  const [hours, minutes] = time.split(':').map(Number);
  const converted = toDate(date);
  converted.setHours(hours, minutes, 0, 0);
  return converted;
}

/**
 * Returns the current and next mod number at given time as date
 * @param date date to get mod at
 * @param daySchedule day schedule for the specified date
 * @see ModNumber
 */
export function getModAtTime(date: Date, daySchedule: DaySchedule): Pick<ScheduleInfo, 'current' | 'next'> {
  if (daySchedule.length === 0) {
    return { current: ModNumber.UNKNOWN, next: ModNumber.UNKNOWN };
  }

  const dayStart = convertTimeToDate(daySchedule[0][0], date);
  const dayEnd = convertTimeToDate(last(daySchedule)[1], date);
  if (isBefore(date, dayStart)) {
    return { current: ModNumber.BEFORE_SCHOOL, next: daySchedule[0][2] };
  } else if (isAfter(date, dayEnd)) {
    return { current: ModNumber.AFTER_SCHOOL, next: ModNumber.AFTER_SCHOOL };
  }

  for (let i = 0; i < daySchedule.length; i++) {
    const [modStartTime, modEndTime, modNumber] = daySchedule[i];
    const modStart = convertTimeToDate(modStartTime, date);
    const modEnd = convertTimeToDate(modEndTime, date);
    const isThisMod = isWithinInterval(date, {
      start: modStart,
      end: modEnd,
    });
    if (isThisMod) {
      const nextMod =
        modNumber === ModNumber.FOURTEEN || modNumber === ModNumber.FINALS_FOUR
          ? ModNumber.AFTER_SCHOOL
          : ModNumber.PASSING_PERIOD;
      return { current: modNumber, next: nextMod };
    }

    if (i < daySchedule.length - 1) {
      const [nextModStartTime, , nextMod] = daySchedule[i + 1];
      const nextModStart = convertTimeToDate(nextModStartTime, date);
      const isPassingPeriod = isWithinInterval(date, {
        start: modEnd,
        end: nextModStart,
      });
      if (isPassingPeriod) {
        return { current: ModNumber.PASSING_PERIOD, next: nextMod };
      }
    }
  }
  throw new Error(`Could not find mod at date ${date}!`);
}

/**
 * Returns occupied mods so does not include assembly
 * @param scheduleItem item to get occupied mods from
 */
export function getOccupiedMods({ startMod, length }: ScheduleItem): ModNumber[] {
  return Array(length)
    .fill(undefined)
    .map((_, i) => startMod + i);
}

/**
 * Gets the class from the schedule at the specific mod and day
 * @param modNumber mod to check for class at
 * @param schedule student/staff's schedule for a certain day
 */
export function getClassAtMod(modNumber: ModNumber, userDaySchedule: UserDaySchedule) {
  // occurs when user has empty schedule
  if (modNumber === ModNumber.UNKNOWN || userDaySchedule === undefined) {
    return null;
  }
  return userDaySchedule.find((scheduleItem) => getOccupiedMods(scheduleItem).includes(modNumber)) || null;
}

/**
 * Gets the current and next mod, and their corresponding classes
 * NOTE: After e-learning patch: the datetime param does not determine the current day of the user's schedule,
 *       since the day might be Monday, but student's in-person may follow a Thursday schedule. The datetime
 *       param DOES specify the specific time in the day to get the info at that TIME
 * @param datetime datetime to query
 * @param daySchedule schedule of the specified date
 * @param schedule user's schedule of classes
 */
export function getScheduleInfoAtTime(
  datetime: Date,
  daySchedule: DaySchedule,
  userDaySchedule: UserDaySchedule,
): ScheduleInfo {
  // This returns PASSING_PERIOD, BEFORE_SCHOOL, and AFTER_SCHOOL which are not actual class times
  const { current, next } = getModAtTime(datetime, daySchedule);
  // Since this function is only used to display current class during a class mod,
  // no need to check if current is passing period
  const isNextPassingPeriod = next === ModNumber.PASSING_PERIOD;
  // DO NOT use find and add one since mod numbers may not be continuous
  const nextClassMod = isNextPassingPeriod
    ? daySchedule[daySchedule.findIndex((triplet) => triplet[2] === current) + 1][2]
    : next;

  const currentClass = getClassAtMod(current, userDaySchedule);
  const nextClass = getClassAtMod(nextClassMod, userDaySchedule);
  return { current, next, currentClass, nextClass };
}

/**
 * Checks if a certain date exists in array of dates by day
 * @param queryDate certain date to check
 * @param dates array to check if `queryDate` is in
 */
export function containsDate(queryDate: Date, dates: Date[]) {
  return dates.some((date) => isSameDay(date, queryDate));
}

/**
 * Gets day schedule TYPE on a certain date NOT accounting for breaks/holidays/e-learning logic, useful for display
 * on the schedule cards, which are a reference that does not change with breaks
 * @param queryDate certain date to query
 * @param dates map of special dates from server
 * @param elearningPlans elearning plans from store
 */
export function getDisplayScheduleTypeOnDate(queryDate: Date, dates: DatesState): DayScheduleType {
  const { semesterOneEnd, semesterTwoEnd } = dates;
  if (semesterOneEnd !== null && semesterTwoEnd !== null) {
    const semesterOneFinalsOne = subDays(semesterOneEnd, 1);
    const semesterTwoFinalsOne = subDays(semesterTwoEnd, 1);

    const isSemesterOneFinals = isSameDay(semesterOneFinalsOne, queryDate) || isSameDay(semesterOneEnd, queryDate);
    const isSemesterTwoFinals = isSameDay(semesterTwoFinalsOne, queryDate) || isSameDay(semesterTwoEnd, queryDate);
    if (isSemesterOneFinals || isSemesterTwoFinals) {
      return 'FINALS';
    }
  }

  const calendarDay = queryDate.getDay() - 1;
  if (containsDate(queryDate, dates.earlyDismissal)) {
    return 'EARLY_DISMISSAL';
  }

  if (containsDate(queryDate, dates.assembly)) {
    return 'ASSEMBLY';
  }

  if (containsDate(queryDate, dates.lateStart)) {
    if (calendarDay === 2) {
      return 'LATE_START_WEDNESDAY';
    }
    return 'LATE_START';
  }

  if (calendarDay > 4 || calendarDay < 0) {
    return 'WEEKEND';
  }

  if (calendarDay === 2 || (dates.wednesday !== undefined && containsDate(queryDate, dates.wednesday))) {
    return 'WEDNESDAY';
  }
  return 'REGULAR';
}

/**
 * Gets day schedule TYPE on a certain date accounting for additional school logic (i.e. summer,
 * holidays, e-learning logic), not only for display on schedule cards.
 * @param queryDate certain date to query
 * @param dates map of special dates from server
 * @param elearningPlans elearning plans from store
 */
export function getScheduleTypeOnDate(
  queryDate: Date,
  dates: DatesState,
  elearningPlans: ELearningPlansState,
): DayScheduleType {
  const { semesterOneStart } = dates;

  // Always let summer/break take precedence over weekend
  // If the date is after semesterTwoEnd, they will be refreshed anyways
  if (semesterOneStart !== null && isBefore(queryDate, semesterOneStart)) {
    return 'SUMMER';
  }

  if (containsDate(queryDate, dates.noSchool)) {
    return 'BREAK';
  }

  const calendarDay = queryDate.getDay() - 1; // this is duplicate code, but weekend should take precedence over elearning
  if (calendarDay > 4 || calendarDay < 0) {
    return 'WEEKEND';
  }

  const currentPlan = getPlanOnDate(queryDate, elearningPlans);
  if (currentPlan !== undefined) {
    return 'REGULAR';
  }

  return getDisplayScheduleTypeOnDate(queryDate, dates);
}

/**
 * Returns both calendar day and schedule day (0 is Monday, up to 4, which is Friday), an index to access
 * the USER'S schedule. Necessary for e-learning patch because the calendar weekday may be MONDAY, i.e. 0,
 * but students actually follow their THURSDAY schedule in-person, i.e. 3.
 *
 */
export function getScheduleDay(
  queryDate: Date,
  elearningPlans: ELearningPlansState,
): { scheduleDay: number; calendarDay: number } {
  const calendarDay = queryDate.getDay() - 1;

  /**
   * In completely online (red) or completely in person (green) the days proceeds as normal
   * (guessing it proceeds directly from calendar day)
   * In partial modes, the days are tied
   */

  let scheduleDay = calendarDay; // by default (i.e. a full plan, see isPartialPlan for definitions, follows the calendar day)
  const currentPlan = getPlanOnDate(queryDate, elearningPlans);
  if (currentPlan !== undefined) {
    const isPartial = isPartialPlan(currentPlan);
    if (isPartial) {
      // we begin calculation of current partial day by getting the plan start day
      // then counting the number of weeks mod 5 (days of week)
      const startDate = new Date(currentPlan.dates[0]);
      const weeksSincePlanStart = differenceInCalendarWeeks(queryDate, startDate, {
        weekStartsOn: startDate.getDay() as 1 | 2 | 3 | 4 | 5,
      });
      scheduleDay = weeksSincePlanStart % 5;
    }
  }
  return { calendarDay, scheduleDay };
}

export function getPlanOnDate(queryDate: Date, elearningPlans: ELearningPlansState) {
  return elearningPlans.find((plan) =>
    containsDate(
      queryDate,
      plan.dates.map((str) => new Date(str)),
    ),
  );
}

/**
 * Returns whether or not a specific e-learning plan is partial, i.e. some people go to school
 * A plan is either partial of full. Full means that everyone follows the same thing (either stay at home in red or in person in green)
 * @param plan
 */
function isPartialPlan(plan: ELearningPlanSchema) {
  return Object.entries(plan.groups).some((group) => group.length > 0);
}

/**
 * Gets countdown in seconds to end of current period, i.e. passing period or mod
 * @param date date to compute countdown against
 * @param modInfo current and next mod numbers
 * @param daySchedule day schedule to compute against
 */
export function getCountdown(date: Date, { current, next }: ScheduleInfo, daySchedule: DaySchedule) {
  if (current === ModNumber.AFTER_SCHOOL || daySchedule.length === 0) {
    return 0;
  }

  switch (next) {
    case ModNumber.PASSING_PERIOD:
    case ModNumber.AFTER_SCHOOL:
      const [, currentEnd] = daySchedule.find((triplet) => triplet[2] === current)!;
      return differenceInSeconds(convertTimeToDate(currentEnd, date), date);
    default:
      const [nextStart] = daySchedule.find((triplet) => triplet[2] === next)!;
      return differenceInSeconds(convertTimeToDate(nextStart, date), date);
  }
}

/**
 * Check if current mod number is a half mod
 * @param modNumber mod number to be checked
 */
export function isHalfMod(modNumber: ModNumber) {
  return modNumber >= ModNumber.FOUR && modNumber <= ModNumber.ELEVEN;
}

/**
 * Checks if processed schedule is completely empty
 * @param schedule processed schedule
 */
export function isScheduleEmpty(schedule: Schedule) {
  return schedule.every((dayUserSchedule) => dayUserSchedule.length === 0);
}

/**
 * Checks if two schedule items are essentially the same
 * @param a first schedule item
 * @param b second schedule item
 */
export function isDuplicateItem(a: ClassItem, b: ClassItem) {
  return a.title === b.title && a.startMod === b.startMod && a.length === b.length && a.day === b.day;
}

/**
 * Transforms ModNumber (from HOMEROOM to all FINALS) into actual mod display string
 * @param modNumber mod number to transform
 */
export function getModNameFromModNumber(modNumber: ModNumber) {
  switch (modNumber) {
    case ModNumber.HOMEROOM:
      return 'Homeroom';
    case ModNumber.ASSEMBLY:
      return 'Assembly';
    case ModNumber.FINALS_ONE:
      return '1st Final';
    case ModNumber.FINALS_TWO:
      return '2nd Final';
    case ModNumber.FINALS_THREE:
      return '3rd Final';
    case ModNumber.FINALS_FOUR:
      return '4th Final';
    default:
      return modNumber.toString();
  }
}

export function getShortNameFromModNumber(modNumber: ModNumber) {
  switch (modNumber) {
    case ModNumber.HOMEROOM:
      return 'HR';
    case ModNumber.ASSEMBLY:
      return 'AS';
    case ModNumber.FINALS_ONE:
    case ModNumber.FINALS_TWO:
    case ModNumber.FINALS_THREE:
    case ModNumber.FINALS_FOUR:
      const index = (modNumber % ModNumber.FINALS_ONE) + 1;
      return index.toString();
    default:
      return modNumber.toString();
  }
}

/**
 * Returns the school start year from a specified date, i.e. May 2019 is still the 2018 school year
 * @param date date to compute school year from
 */
export function getSchoolYearFromDate(date: Date) {
  const currentYear = date.getFullYear();
  const currentMonth = date.getMonth();
  return currentMonth < 5 ? currentYear - 1 : currentYear;
}
