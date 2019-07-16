import { isAfter, isBefore, toDate, isWithinInterval, isSameDay, subDays } from 'date-fns';

import { DaySchedule, ModNumber } from '../types/schedule';
import { DatesState } from '../types/store';
import * as SCHEDULES from '../constants/schedules';

/**
 * Converts a `h:mm` time (from a day schedule timpair) to a date for comparison
 * @param time `h:mm` time string to convert to date (i.e. `8:00`)
 * @param date current day to construct day from to ensure only time comparison
 */
export function convertTimeToDate(time: string, date: Date) {
  const [hours, minutes] = time.split(':').map(Number);
  const converted = toDate(date);
  converted.setHours(hours, minutes, 0, 0);
  return converted;
}

/**
 * Returns the mod number at given time as date
 * @param date date to get mod at
 * @param daySchedule day schedule for the specified date
 * @see ModNumber
 */
export function getModAtTime(date: Date, daySchedule: DaySchedule): ModNumber {
  const dayStart = convertTimeToDate(daySchedule[0][0], date);
  const dayEnd = convertTimeToDate(daySchedule.slice(-1)[0][0], date);
  if (isBefore(date, dayStart)) {
    return ModNumber.BEFORE_SCHOOL;
  } else if (isAfter(date, dayEnd)) {
    return ModNumber.AFTER_SCHOOL;
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
      return modNumber;
    }

    if (i < daySchedule.length - 1) {
      const [nextModStartTime] = daySchedule[i + 1];
      const nextModStart = convertTimeToDate(nextModStartTime, date);
      const isPassingPeriod = isWithinInterval(date, {
        start: modEnd,
        end: nextModStart,
      });
      if (isPassingPeriod) {
        return ModNumber.PASSING_PERIOD;
      }
    }
  }
  throw new Error(`Could not find mod at date ${date}!`);
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
 * Check if current mod number is a half mod
 * @param modNumber mod number to be checked
 */
export function isHalfMod(modNumber: ModNumber) {
  return modNumber >= ModNumber.FOUR && modNumber <= ModNumber.ELEVEN;
}
