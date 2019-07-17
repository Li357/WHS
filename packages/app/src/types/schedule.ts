interface RawClassItemData {
  courseId: string;
}
export interface RawClassItem {
  sourceId: number;
  sourceType: string;
  title: string;
  body: string;
  roomNumber: string;
  day: number;
  startMod: number;
  length: number;
  endMod: number;
  sectionNumber: number;
  phaseNumber: number;
  data: RawClassItemData | null;
}

export type RawClassItemKeys = 'sectionNumber' | 'phaseNumber' | 'data';
export type ClassItem = Omit<RawClassItem, RawClassItemKeys>;

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
export type UserDaySchedule = ScheduleItem[];
export type RawSchedule = RawClassItem[];
export type Schedule = UserDaySchedule[];
export interface TeacherSchedule {
  url: string;
  name: string;
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

  UNKNOWN = 20,
}
export type DaySchedule = Array<[string, string, ModNumber]>;

export interface ScheduleInfo {
  current: ModNumber;
  currentClass: ScheduleItem | null;
  next: ModNumber | null;
  nextClass: ScheduleItem | null;
}
