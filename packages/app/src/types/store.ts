import { Action } from 'redux';
import { ELearningPlanSchema, CustomDateSchema } from '@whs/server';

import { Schedule, TeacherSchedule } from './schedule';
import * as SCHEDULES from '../constants/schedules';

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
  SET_USER_SCHEDULE = 'SET_USER_SCHEDULE', // This should only be used for debug purposes
  SET_TEACHER_SCHEDULES = 'SET_TEACHER_SCHEDULES',
  ADD_TEACHER_SCHEDULE = 'ADD_TEACHER_SCHEDULE',
}

interface AppActionType<K, P> extends Action<K> {
  payload: P;
}

export type SetUserCredentialsAction = AppActionType<
  UserActions.SET_USER_CREDENTIALS,
  Pick<UserState, 'username' | 'password'>
>;

export type UserInfoKeys = 'name' | 'schoolPicture' | 'profilePhoto' | 'isTeacher' | 'classOf' | UserOverviewKeys;
export type UserInfo = Pick<UserState, UserInfoKeys>;
export type SetUserInfoAction = AppActionType<UserActions.SET_USER_INFO, Partial<UserInfo>>;

export type SetUserScheduleAction = AppActionType<UserActions.SET_USER_SCHEDULE, Schedule>;
export type SetTeacherSchedulesAction = AppActionType<UserActions.SET_TEACHER_SCHEDULES, TeacherSchedule[]>;
export type AddTeacherScheduleAction = AppActionType<UserActions.ADD_TEACHER_SCHEDULE, TeacherSchedule>;

export type DayScheduleType = keyof typeof SCHEDULES;
export interface DayState {
  refreshedSemesterOne: boolean;
  refreshedSemesterTwo: boolean;
  schedule: DayScheduleType;
}

export enum DayActions {
  SET_DAY_SCHEDULE = 'SET_DAY_SCHEDULE',
  SET_REFRESHED = 'SET_REFRESHED',
}

export type SetDayScheduleAction = AppActionType<DayActions.SET_DAY_SCHEDULE, DayScheduleType>;
export type SetRefreshedAction = AppActionType<DayActions.SET_REFRESHED, [boolean, boolean]>;

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

export type SetThemeAction = AppActionType<ThemeActions.SET_THEME, Theme>;

export interface DatesState {
  assembly: Date[];
  noSchool: Date[];
  earlyDismissal: Date[];
  lateStart: Date[];
  wednesday: Date[];
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
  wednesday: string[];
  semesterOneStart: string | null;
  semesterOneEnd: string | null;
  semesterTwoStart: string | null;
  semesterTwoEnd: string | null;
}

export enum DatesActions {
  SET_DATES = 'SET_DATES',
}

export type SetDatesAction = AppActionType<DatesActions.SET_DATES, Partial<DatesState>>;

export type ELearningPlansState = ELearningPlanSchema[];

export enum ELearningPlansActions {
  SET_PLANS = 'SET_PLANS',
}

export type SetELearningPlansAction = AppActionType<ELearningPlansActions.SET_PLANS, ELearningPlansState>;

export type CustomDatesState = CustomDateSchema[];

export enum CustomDatesActions {
  SET_DATES = 'SET_DATES',
}

export type SetCustomDatesActions = AppActionType<CustomDatesActions.SET_DATES, CustomDatesState>;

export enum MiscellaneousActions {
  LOG_OUT = 'LOG_OUT',
  OTHER = '',
}

export interface LogOutAction extends Action<MiscellaneousActions.LOG_OUT> {}
export interface OtherAction extends Action<MiscellaneousActions.OTHER> {} /* handles third-party actions for TS */

export type UserAction =
  | SetUserCredentialsAction
  | SetUserInfoAction
  | SetUserScheduleAction
  | SetTeacherSchedulesAction
  | AddTeacherScheduleAction
  | OtherAction;
export type DayAction = SetRefreshedAction | SetDayScheduleAction | OtherAction;
export type ThemeAction = SetThemeAction | OtherAction;
export type DatesAction = SetDatesAction | OtherAction;
export type ELearningPlansAction = SetELearningPlansAction | OtherAction;
export type CustomDatesAction = SetCustomDatesActions | OtherAction;
export type MiscellaneousAction = LogOutAction | OtherAction;

export interface AppState {
  user: UserState;
  day: DayState;
  dates: DatesState;
  theme: ThemeState;
  elearningPlans: ELearningPlansState;
  customDates: CustomDatesState;
}
export type AppAction =
  | UserAction
  | DayAction
  | ThemeAction
  | DatesAction
  | ELearningPlansAction
  | CustomDatesAction
  | MiscellaneousAction;
