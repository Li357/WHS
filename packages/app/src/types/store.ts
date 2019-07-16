import { Action } from 'redux';

import { Schedule, DaySchedule, TeacherSchedule } from './schedule';

export type UserOverviewKeys = 'homeroom' | 'counselor' | 'dean' | 'id';
export type UserOverviewMap = { [K in UserOverviewKeys]: string };
export interface UserState {
  username: string;
  password: string;
  name: string;
  schedule: Schedule;
  schoolPicture: string;
  profilePhoto: string;
  isTeacher: boolean;
  classOf: string;
  teacherSchedules: TeacherSchedule[];

  /** Student-specific properties */
  homeroom?: string;
  counselor?: string;
  dean?: string;
  id?: string;
}

export enum UserActions {
  SET_USER_CREDENTIALS = 'SET_USER_CREDENTIALS',
  SET_USER_INFO = 'SET_USER_INFO',
  SET_USER_SCHEDULE = 'SET_USER_SCHEDULE',
  SET_TEACHER_SCHEDULES = 'SET_TEACHER_SCHEDULES',
  ADD_TEACHER_SCHEDULE = 'ADD_TEACHER_SCHEDULE',
}

export interface SetUserCredentialsAction extends Action<UserActions.SET_USER_CREDENTIALS> {
  payload: Pick<UserState, 'username' | 'password'>;
}

export type UserInfoKeys = | 'name' | 'schoolPicture' | 'profilePhoto' | 'isTeacher' | 'classOf' | UserOverviewKeys;
export type UserInfo = Pick<UserState, UserInfoKeys>;
export interface SetUserInfoAction extends Action<UserActions.SET_USER_INFO> {
  payload: Partial<UserInfo>;
}

export interface SetUserScheduleAction extends Action<UserActions.SET_USER_SCHEDULE> {
  payload: Schedule;
}

export interface SetTeacherSchedulesAction extends Action<UserActions.SET_TEACHER_SCHEDULES> {
  payload: TeacherSchedule[];
}

export interface AddTeacherScheduleAction extends Action<UserActions.ADD_TEACHER_SCHEDULE> {
  payload: TeacherSchedule;
}

export interface DayState {
  schedule: DaySchedule;
  lastStateUpdate: Date | null;
}
export interface SerializedDayState {
  schedule: DaySchedule;
  lastStateUpdate: string | null;
}

export enum DayActions {
  UPDATE_DAY_STATE = 'UPDATE_DAY_STATE',
  SET_DAY_SCHEDULE = 'SET_DAY_SCHEDULE',
}

export interface UpdateDayStateAction extends Action<DayActions.UPDATE_DAY_STATE> {
  payload: Date | null;
}

export interface SetDayScheduleAction extends Action<DayActions.SET_DAY_SCHEDULE> {
  payload: DaySchedule;
}

export interface ThemeState {
  backgroundColor: string;
  foregroundColor: string;
  borderColor: string;
  accentColor: string;
  textColor: string;
  subtextColor: string;
  statusBar: 'light-content' | 'dark-content';
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

export interface DatesState {
  assembly: Date[];
  noSchool: Date[];
  earlyDismissal: Date[];
  lateStart: Date[];
  semesterOneStart: Date | null;
  semesterOneEnd: Date | null;
  semesterTwoStart: Date | null;
  semesterTwoEnd: Date | null;
}
export interface SerializedDatesState {
  assembly: string[];
  noSchool: string[];
  earlyDismissal: string[];
  lateStart: string[];
  semesterOneStart: string | null;
  semesterOneEnd: string | null;
  semesterTwoStart: string | null;
  semesterTwoEnd: string | null;
}

export enum DatesActions {
  SET_DATES = 'SET_DATES',
}

export interface SetDatesAction extends Action<DatesActions.SET_DATES> {
  payload: Partial<DatesState>;
}

export enum MiscellaneousActions {
  LOG_OUT = 'LOG_OUT',
  OTHER = '',
}

export interface LogOutAction extends Action<MiscellaneousActions.LOG_OUT> {}
export interface OtherAction extends Action<MiscellaneousActions.OTHER> {} /* handles third-party actions for TS */

export type UserAction =
  | SetUserCredentialsAction | SetUserInfoAction | SetUserScheduleAction | SetTeacherSchedulesAction
  | AddTeacherScheduleAction | OtherAction;
export type DayAction = UpdateDayStateAction | SetDayScheduleAction | OtherAction;
export type ThemeAction = SetThemeAction | OtherAction;
export type DatesAction = SetDatesAction | OtherAction;
export type MiscellaneousAction = LogOutAction | OtherAction;

export interface AppState {
  user: UserState;
  day: DayState;
  dates: DatesState;
  theme: ThemeState;
}
export type AppAction = UserAction | DayAction | ThemeAction | DatesAction | MiscellaneousAction;
