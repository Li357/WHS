import { ScheduleInfo, ModNumber, ScheduleItem, ClassItem, DaySchedule, UserDaySchedule } from '../types/schedule';
import { DashboardInfoGetter } from '../types/dashboard-info';
import { formatDuration } from './duration';
import { isHalfMod, getModNameFromModNumber } from './query-schedule';
import * as SCHEDULES from '../constants/schedules';

function createTimeLeftInfo(name: string) {
  return function timeLeftInfo(timeLeft: number) {
    return { title: formatDuration(timeLeft), name };
  };
}

function createTextInfo(title: string) {
  return function textInfo() {
    return { title };
  };
}

function createModInfo(name: string, selector: (scheduleInfo: ScheduleInfo) => ModNumber) {
  return function modInfo(timeLeft: number, scheduleInfo: ScheduleInfo) {
    const modNumber = selector(scheduleInfo);
    const mod = getModNameFromModNumber(modNumber);
    return {
      title: mod,
      name: `${name}${isHalfMod(modNumber) ? ' half' : ''} mod`,
    };
  };
}

function createClassInfo(name: string, selector: (ScheduleInfo: ScheduleInfo) => ScheduleItem) {
  return function classInfo(timeLeft: number, scheduleInfo: ScheduleInfo) {
    const scheduleItem = selector(scheduleInfo);
    if (scheduleItem.hasOwnProperty('columns')) {
      return {
        title: 'Cross Sectioned',
        name: `${name} class`,
        scheduleItem,
      };
    }
    const { title, body } = scheduleItem as ClassItem;
    const subtitleObj = body !== '' ? { subtitle: body } : {};
    return { title, ...subtitleObj, name: `${name} class` };
  };
}

const currentModInfo = createModInfo('current', (info) => info.current);
const currentClassInfo = createClassInfo('current', (info) => info.currentClass!);
const nextModInfo = createModInfo('next', (info) => info.next!);
const nextClassInfo = createClassInfo('next', (info) => info.nextClass!);

const beforeSchoolInfo = createTimeLeftInfo('until school starts');
const passingPeriodLeftInfo = createTimeLeftInfo('until passing period ends');
const modLeftInfo = createTimeLeftInfo('until mod ends');

const afterSchoolInfo = createTextInfo("You're done for the day!");
const breakInfo = createTextInfo('Enjoy your break!');
const summerInfo = createTextInfo('Enjoy your summer!');
const weekendInfo = createTextInfo('Enjoy your weekend!');
const scheduleEmptyInfo = createTextInfo('Your schedule is empty.');

function dayEndsInfo(timeLeft: number, scheduleInfo: ScheduleInfo, dayEnd: number) {
  return { title: formatDuration(dayEnd), name: 'until day ends' };
}

/**
 * Gets the information to show on the dashboard based on current mod
 * @param scheduleInfo contains current mod
 */
export function getDashboardInfo(
  daySchedule: DaySchedule,
  userDaySchedule: UserDaySchedule,
  { current }: ScheduleInfo,
): DashboardInfoGetter[] {
  if (userDaySchedule.length === 0) {
    return [scheduleEmptyInfo];
  }

  switch (daySchedule) {
    case SCHEDULES.BREAK:
      return [breakInfo];
    case SCHEDULES.WEEKEND:
      return [weekendInfo];
    case SCHEDULES.SUMMER:
      return [summerInfo];
  }

  switch (current) {
    case ModNumber.BEFORE_SCHOOL:
      return [beforeSchoolInfo];
    case ModNumber.AFTER_SCHOOL:
      return [afterSchoolInfo];
    // currentMod and currentClass will both be homeroom, repetitive
    case ModNumber.HOMEROOM:
      return [currentClassInfo, modLeftInfo, nextClassInfo, dayEndsInfo];
    case ModNumber.PASSING_PERIOD:
      return [nextClassInfo, passingPeriodLeftInfo, nextModInfo, dayEndsInfo];
    case ModNumber.FINALS_FOUR:
    case ModNumber.FOURTEEN:
      return [currentModInfo, modLeftInfo, currentClassInfo];
    default:
      return [currentModInfo, modLeftInfo, nextClassInfo, currentClassInfo, dayEndsInfo];
  }
}
