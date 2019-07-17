import { ScheduleInfo, ModNumber, ScheduleItem, CrossSectionedItem, ClassItem } from '../types/schedule';
import { DashboardInfoGetter } from '../types/dashboard-info';
import { formatDuration } from './duration';
import { isHalfMod } from './query-schedule';

function createTimeLeftInfo(name: string) {
  return function timeLeftInfo(timeLeft: number) {
    return { title: formatDuration(timeLeft), name };
  };
}

function afterSchoolInfo() {
  return { title: "You're done for the day!" };
}

function createModInfo(name: string, selector: (scheduleInfo: ScheduleInfo) => ModNumber) {
  return function modInfo(timeLeft: number, scheduleInfo: ScheduleInfo) {
    const mod = selector(scheduleInfo);
    return {
      title: mod.toString(),
      name: `${name}${isHalfMod(mod) ? ' half' : ''} mod`,
    };
  };
}

function createClassInfo(name: string, selector: (ScheduleInfo: ScheduleInfo) => ScheduleItem) {
  return function classInfo(timeLeft: number, scheduleInfo: ScheduleInfo) {
    const scheduleItem = selector(scheduleInfo);
    // Just to fix type errors
    const asClassItem = scheduleItem as ClassItem;
    const asCrossSection = scheduleItem as CrossSectionedItem;
    const title = asCrossSection.columns ? 'Cross Sectioned' : asClassItem.title;
    return { title, name: `${name} class` };
  };
}

const currentModInfo = createModInfo('current', (info) => info.current);
const currentClassInfo = createClassInfo('current', (info) => info.currentClass!);
const nextModInfo = createModInfo('next', (info) => info.next!);
const nextClassInfo = createClassInfo('next', (info) => info.nextClass!);

const beforeSchoolInfo = createTimeLeftInfo('before school starts');
const passingPeriodLeftInfo = createTimeLeftInfo('until passing period ends');
const modLeftInfo = createTimeLeftInfo('util mod ends');

// TODO: add until day ends info
function dayEndsInfo() {
  return { title: 'TODO', name: 'until day ends' };
}

/**
 * Gets the information to show on the dashboard based on current mod
 * @param scheduleInfo contains current mod
 */
export function getDashboardInfo({ current }: ScheduleInfo): DashboardInfoGetter[] {
  // TODO: handle summer, break, empty schedules, weekends
  switch (current) {
    case ModNumber.BEFORE_SCHOOL:
      return [beforeSchoolInfo];
    case ModNumber.AFTER_SCHOOL:
      return [afterSchoolInfo];
    case ModNumber.PASSING_PERIOD:
      return [nextClassInfo, passingPeriodLeftInfo, nextModInfo, dayEndsInfo];
    case ModNumber.FOURTEEN:
      return [currentModInfo, modLeftInfo, currentClassInfo];
    default:
      return [currentModInfo, modLeftInfo, currentClassInfo, nextClassInfo, dayEndsInfo];
  }
}
