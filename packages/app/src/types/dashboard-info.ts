import { ScheduleInfo } from './schedule';

export interface DashboardInfo {
  title: string;
  subtitle?: string;
  name?: string;
}

export type DashboardInfoGetter = (timeLeft: number, scheduleInfo: ScheduleInfo) => DashboardInfo;
