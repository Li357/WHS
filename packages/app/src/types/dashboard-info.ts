import { ScheduleInfo, ScheduleItem } from './schedule';

export interface DashboardInfo {
  title: string;
  subtitle?: string;
  name?: string;
  crossSectioned?: boolean;
  scheduleItem?: ScheduleItem;
}

export type DashboardInfoGetter = (timeLeft: number, scheduleInfo: ScheduleInfo, dayEnd: number) => DashboardInfo;
