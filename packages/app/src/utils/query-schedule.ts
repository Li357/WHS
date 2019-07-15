import { isAfter, isBefore, toDate, isWithinInterval } from 'date-fns';

import { DayState, DayInfoKeys } from '../types/store';
import { DaySchedule, ModNumber } from '../types/schedule';

/* Schedule Querying */

/**
 * Converts a `h:mm` time (from a day schedule timpair) to a date for comparison
 * @param time `h:mm` time string to convert to date (i.e. `8:00`)
 * @param date current day to construct day from to ensure only time comparison
 */
function convertTimeToDate(time: string, date: Date) {
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
 * Gets 
 * @param date 
 * @param dayInfo 
 */
export function getDayScheduleOnDate(date: Date, dayInfo: Pick<DayState, DayInfoKeys>) {
  
}

/**
 * Check if current mod number is a half mod
 * @param modNumber mod number to be checked
 */
export function isHalfMod(modNumber: ModNumber) {
  return modNumber >= ModNumber.FOUR && modNumber <= ModNumber.ELEVEN;
}
