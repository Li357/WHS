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
  return { title: 'You\'re done for the day!' };
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
    const asClassItem = scheduleItem as ClassItem;
    const asCrossSectioned = scheduleItem as CrossSectionedItem;

    const crossSectioned = asCrossSectioned.columns !== undefined;
    const title = crossSectioned ? asClassItem.title : 'Cross Sectioned';
    return { title, name: `${name} class`, crossSectioned };
  };
}

const currentModInfo = createModInfo('current', (info) => info.current);
const currentClassInfo = createClassInfo('current', (info) => info.currentClass!);
const nextModInfo = createModInfo('next', (info) => info.next!);
const nextClassInfo = createClassInfo('next', (info) => info.nextClass!);

const beforeSchoolInfo = createTimeLeftInfo('until school starts');
const passingPeriodLeftInfo = createTimeLeftInfo('until passing period ends');
const modLeftInfo = createTimeLeftInfo('until mod ends');

// TODO: add until day ends info
function dayEndsInfo(timeLeft: number, scheduleInfo: ScheduleInfo, dayEnd: number) {
  return { title: formatDuration(dayEnd), name: 'until day ends' };
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
