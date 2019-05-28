export interface ClassItem {
  sourceId: number;
  sourceType: string;
  title: string;
  body: string;
  roomNumber: string;
  day: number;
  startMod: number;
  length: number;
  endMod: number;
}

export type CrossSectionedColumn = ClassItem[];
export interface CrossSectionedItem {
  sourceId: number;
  columns: CrossSectionedColumn[];
  day: number;
  startMod: number;
  length: number;
  endMod: number;
}

export type ScheduleItem = ClassItem | CrossSectionedItem;
export type RawSchedule = ClassItem[];
export type UserDaySchedule = ScheduleItem[];
export type Schedule = UserDaySchedule[];
export interface TeacherSchedule {
  url: string;
  schedule: Schedule;
}

export enum ModNumber {
  HOMEROOM = 0,
  ONE = 1,
  TWO = 2,
  THREE = 3,
  FOUR = 4,
  FIVE = 5,
  SIX = 6,
  SEVEN = 7,
  EIGHT = 8,
  NINE = 9,
  TEN = 10,
  ELEVEN = 11,
  TWELVE = 12,
  THIRTEEN = 13,
  FOURTEEN = 14,

  BEFORE_SCHOOL = 15,
  AFTER_SCHOOL = 16,
  PASSING_PERIOD = 17,
  ASSEMBLY = 18,
  FINALS = 19,
}
export type DaySchedule = Array<[string, string, ModNumber]>;
