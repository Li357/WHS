import { Schema } from '../../shared/types/api';

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

export interface LegacyDateSchema extends Schema {
  type: DateTypeKey;
  year: string;
  dates: LegacyDate[];
}

export interface LegacyOtherDateSchema extends Schema {
  [yearRange: string]: object | string;
}

export interface LegacySettingsSchema extends Schema {
  type: '5';
  year: string;
  settings: Settings;
}
