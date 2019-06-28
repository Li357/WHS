export type DateTypeKey = '1' | '2' | '3' | '4';

export interface Date {
  date: string;
  comment: string;
}

export interface Settings {
  semesterOneStart: string;
  semesterOneEnd: string;
  semesterTwoStart: string;
  lastDay: string;
}

export interface DateSchema {
  type: DateTypeKey;
  year: string;
  dates: Date[];
}

export interface SettingsSchema {
  type: 5;
  year: string;
  settings: Settings;
}
