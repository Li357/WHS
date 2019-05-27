import { Action } from 'redux';

import { Schedule, DaySchedule } from './schedule';

export interface UserState {
  username: string;
  password: string;
  name: string;
  schedule: Schedule;
  schoolPicture: string;
  profilePhoto: string;
  isTeacher: boolean;
  addedSchedules: Schedule[];

  /** Student-specific properties */
  classOf?: string;
  homeroom?: string;
  counselor?: string;
  dean?: string;
  id?: string;
}

export enum UserActions {
  SET_USER_INFO = 'SET_USER_INFO',
  SET_USER_SCHEDULE = 'SET_USER_SCHEDULE',
  ADD_SCHEDULE = 'ADD_SCHEDULE',
}

export type UserInfoKeys =
  | 'username' | 'password' | 'name' | 'schoolPicture' | 'profilePhoto' | 'isTeacher'
  | 'classOf' | 'homeroom' | 'counselor' | 'dean' | 'id';
export interface SetUserInfoAction extends Action<UserActions.SET_USER_INFO> {
  payload: Partial<Pick<UserState, UserInfoKeys>>;
}

export interface SetUserScheduleAction extends Action<UserActions.SET_USER_SCHEDULE> {
  payload: Schedule;
}

export interface AddScheduleAction extends Action<UserActions.ADD_SCHEDULE> {
  payload: Schedule;
}

export interface DayState {
  daySchedule: DaySchedule;
  isBreak: boolean;
  isFinals: boolean;
  hasAssembly: boolean;
  lastStateUpdate: Date | null;
}

export enum DayActions {
  SET_DAY_INFO = 'SET_DAY_INFO',
  SET_DAY_SCHEDULE = 'SET_DAY_SCHEDULE',
}

export type DayInfoKeys = 'isBreak' | 'isFinals' | 'hasAssembly' | 'lastStateUpdate';
export interface SetDayInfoAction extends Action<DayActions.SET_DAY_INFO> {
  payload: Partial<Pick<DayState, DayInfoKeys>>;
}

export interface SetDayScheduleAction extends Action<DayActions.SET_DAY_SCHEDULE> {
  payload: DaySchedule;
}

export type FontThemeKeys = 'titleFont' | 'subtitleFont';
export interface ThemeState {
  backgroundColor: string;
  foregroundColor: string;
  textColor: string;
  subtextColor: string;
  borderColor: string;
  accentColor: string;

  titleFont: string;
  subtitleFont: string;
}

export enum ThemeActions {
  SET_THEME = 'SET_THEME',
}

export enum Theme {
  LIGHT = 'light',
  DARK = 'dark',
}

export interface SetThemeAction extends Action<ThemeActions.SET_THEME> {
  payload: Theme;
}

export enum MiscellaneousActions {
  LOG_OUT = 'LOG_OUT',
  OTHER = '',
}

export interface LogOutAction extends Action<MiscellaneousActions.LOG_OUT> {}
export interface OtherAction extends Action<MiscellaneousActions.OTHER> {} /* handles third-party actions for TS */

export type UserAction = SetUserInfoAction | SetUserScheduleAction | AddScheduleAction | OtherAction;
export type DayAction = SetDayInfoAction | SetDayScheduleAction | OtherAction;
export type ThemeAction = SetThemeAction | OtherAction;
export type MiscellaneousAction = LogOutAction | OtherAction;

export interface AppState {
  user: UserState;
  day: DayState;
  theme: ThemeState;
}
export type AppAction = UserAction | DayAction | ThemeAction | MiscellaneousAction;
