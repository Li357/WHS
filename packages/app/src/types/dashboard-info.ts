import { ScheduleInfo } from './schedule';

export interface DashboardInfo {
  title: string;
  subtitle?: string;
  name?: string;
  crossSectioned?: boolean;
}

export type DashboardInfoGetter = (timeLeft: number, scheduleInfo: ScheduleInfo, dayEnd: number) => DashboardInfo;
