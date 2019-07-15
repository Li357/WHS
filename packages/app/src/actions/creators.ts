// tslint:disable: object-literal-sort-keys

import {
  UserActions, UserState, UserInfoKeys,
  SetUserInfoAction, SetUserScheduleAction, SetUserCredentialsAction,
  SetTeacherSchedulesAction, AddTeacherScheduleAction,
  DayState, DayActions, DayInfoKeys, SetDayInfoAction, SetDayScheduleAction,
  Theme, SetThemeAction, ThemeActions,
  DatesState,
  MiscellaneousActions, LogOutAction, OtherAction, DatesActions,
} from '../types/store';
import { Schedule, DaySchedule, TeacherSchedule } from '../types/schedule';

export const setUserCredentials = (payload: Pick<UserState, 'username' | 'password'>): SetUserCredentialsAction => ({
  type: UserActions.SET_USER_CREDENTIALS,
  payload,
});

export const setUserInfo = (payload: Partial<Pick<UserState, UserInfoKeys>>): SetUserInfoAction => ({
  type: UserActions.SET_USER_INFO,
  payload,
});

export const setUserSchedule = (payload: Schedule): SetUserScheduleAction => ({
  type: UserActions.SET_USER_SCHEDULE,
  payload,
});

export const setTeacherSchedules = (payload: TeacherSchedule[]): SetTeacherSchedulesAction => ({
  type: UserActions.SET_TEACHER_SCHEDULES,
  payload,
});

export const addTeacherSchedule = (payload: TeacherSchedule): AddTeacherScheduleAction => ({
  type: UserActions.ADD_TEACHER_SCHEDULE,
  payload,
});

export const setDayInfo = (payload: Partial<Pick<DayState, DayInfoKeys>>): SetDayInfoAction => ({
  type: DayActions.SET_DAY_INFO,
  payload,
});

export const setDaySchedule = (payload: DaySchedule): SetDayScheduleAction => ({
  type: DayActions.SET_DAY_SCHEDULE,
  payload,
});

export const setTheme = (payload: Theme): SetThemeAction => ({
  type: ThemeActions.SET_THEME,
  payload,
});

export const setDates = (payload: Partial<DatesState>) => ({
  type: DatesActions.SET_DATES,
  payload,
});

export const logOut = (): LogOutAction => ({
  type: MiscellaneousActions.LOG_OUT,
});

export const other = (): OtherAction => ({
  type: MiscellaneousActions.OTHER,
});
