interface ScheduleItemData {
  courseId: string;
}

export interface ScheduleItem {
  sourceId: number;
  sourceType: string;
  title: string;
  body: string;
  roomNumber: string;
  sectionNumber: number;
  phaseNumber: number;
  day: number;
  startMod: number;
  length: number;
  endMod: number;
  data: ScheduleItemData | null;
}

export type Schedule = ScheduleItem[][]; /* user's schedule for all days */
export type DaySchedule = Array<[string, string]>; /* array of timepairs for a day */
