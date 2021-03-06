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

export type ClassItem = Omit<RawClassItem, 'roomNumber' | 'sectionNumber' | 'phaseNumber' | 'data'>;
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

export interface RawTeacherData {
  id: number;
  schoolId: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string;
  departmentId: number;
  profilePictureUri: string | null;
  deleted: boolean;
}

export enum ModNumber {
  HOMEROOM,
  ONE,
  TWO,
  THREE,
  FOUR,
  FIVE,
  SIX,
  SEVEN,
  EIGHT,
  NINE,
  TEN,
  ELEVEN,
  TWELVE,
  THIRTEEN,
  FOURTEEN,
  FIFTEEN, // used for endMod of last mod

  ASSEMBLY,
  FINALS_ONE,
  FINALS_TWO,
  FINALS_THREE,
  FINALS_FOUR,

  PASSING_PERIOD,
  BEFORE_SCHOOL,
  AFTER_SCHOOL,

  UNKNOWN,
}
export type DaySchedule = Array<[string, string, ModNumber]>;

export interface ScheduleInfo {
  current: ModNumber;
  currentClass: ScheduleItem | null;
  next: ModNumber;
  nextClass: ScheduleItem | null;
}
