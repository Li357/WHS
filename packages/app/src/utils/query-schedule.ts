import { isAfter, isBefore, toDate, isWithinInterval, isSameDay, subDays, differenceInSeconds } from 'date-fns';

import { DaySchedule, ModNumber, ModInfo, Schedule, ScheduleInfo } from '../types/schedule';
import { DatesState } from '../types/store';
import * as SCHEDULES from '../constants/schedules';

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
export function getModAtTime(date: Date, daySchedule: DaySchedule): Pick<ModInfo, 'current' | 'next'> {
  const dayStart = convertTimeToDate(daySchedule[0][0], date);
  const dayEnd = convertTimeToDate(daySchedule.slice(-1)[0][1], date);
  if (isBefore(date, dayStart)) {
    return { current: ModNumber.BEFORE_SCHOOL, next: daySchedule[0][2] };
  } else if (isAfter(date, dayEnd)) {
    return { current: ModNumber.AFTER_SCHOOL, next: null };
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
      const nextMod = i === daySchedule.length ? ModNumber.AFTER_SCHOOL : ModNumber.PASSING_PERIOD;
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
 * Gets the class from the schedule at the specific mod and day
 * @param modNumber mod to check for class at
 * @param schedule student/staff's schedule
 * @param day day of week to query
 */
export function getClassAtMod(modNumber: ModNumber, schedule: Schedule, day: number) {
  const classSchedule = schedule[day];
  return classSchedule.find(({ startMod, endMod }) => startMod <= modNumber && endMod >= modNumber) || null;
}

/**
 * Gets the current and next mod, and their corresponding classes
 * @param date day to query
 * @param daySchedule schedule of the specified date
 * @param schedule user's schedule of classes
 */
export function getScheduleInfoAtTime(date: Date, daySchedule: DaySchedule, schedule: Schedule): ScheduleInfo {
  const { current, next } = getModAtTime(date, daySchedule);
  const currentClass = getClassAtMod(current, schedule, date.getDay());
  const nextClass = next !== null ? getClassAtMod(next, schedule, date.getDay()) : null;
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
 * Gets day schedule on a certain date
 * @param queryDate certain date to query
 * @param dates map of special dates from server
 */
export function getScheduleOnDate(queryDate: Date, dates: DatesState) {
  const { semesterOneEnd, semesterTwoEnd } = dates;
  if (semesterOneEnd !== null && semesterTwoEnd !== null) {
    const semesterOneFinalsOne = subDays(semesterOneEnd, 1);
    const semesterTwoFinalsOne = subDays(semesterTwoEnd, 1);

    const isSemesterOneFinals = isSameDay(semesterOneFinalsOne, queryDate) || isSameDay(semesterOneEnd, queryDate);
    const isSemesterTwoFinals = isSameDay(semesterTwoFinalsOne, queryDate) || isSameDay(semesterTwoEnd, queryDate);
    if (isSemesterOneFinals || isSemesterTwoFinals) {
      return SCHEDULES.FINALS;
    }
  }

  // TODO: Check for summer
  if (containsDate(queryDate, dates.noSchool)) {
    return SCHEDULES.BREAK;
  }

  if (containsDate(queryDate, dates.earlyDismissal)) {
    return SCHEDULES.EARLY_DISMISSAL;
  }

  if (containsDate(queryDate, dates.assembly)) {
    return SCHEDULES.ASSEMBLY;
  }

  const day = queryDate.getDay();
  if (containsDate(queryDate, dates.lateStart)) {
    if (day === 3) {
      return SCHEDULES.LATE_START_WEDNESDAY;
    }
    return SCHEDULES.LATE_START;
  }

  if (day === 3) {
    return SCHEDULES.WEDNESDAY;
  }
  return SCHEDULES.REGULAR;
}

/**
 * Gets countdown in seconds to end of current period, i.e. passing period or mod
 * @param date date to compute countdown against
 * @param modInfo current and next mod numbers
 * @param daySchedule day schedule to compute against
 */
export function getCountdown(date: Date, { current, next }: ScheduleInfo, daySchedule: DaySchedule) {
  switch (next) {
    case ModNumber.PASSING_PERIOD:
    case ModNumber.AFTER_SCHOOL:
      const [, currentEnd] = daySchedule.find((triplet) => triplet[2] === current)!;
      return differenceInSeconds(convertTimeToDate(currentEnd, date), date);
    case null:
      return 0;
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
