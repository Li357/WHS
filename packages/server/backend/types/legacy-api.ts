export type DateTypeKey = '1' | '2' | '3' | '4';

export interface LegacyDate {
  date: string;
  comment: string;
}

export interface Settings {
  semesterOneStart: string;
  semesterOneEnd: string;
  semesterTwoStart: string;
  lastDay: string;
}

export interface LegacyDateSchema {
  type: DateTypeKey;
  year: string;
  dates: Date[];
}

export interface LegacySettingsSchema {
  type: 5;
  year: string;
  settings: Settings;
}
