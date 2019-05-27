// tslint:disable: object-literal-sort-keys

import {
  UserActions, UserState, SetUserInfoAction, UserInfoKeys, SetUserScheduleAction, AddScheduleAction,
  DayState, DayActions, DayInfoKeys, SetDayInfoAction, SetDayScheduleAction,
  Theme, SetThemeAction, ThemeActions,
  MiscellaneousActions, LogOutAction,
} from '../types/store';
import { Schedule, DaySchedule } from '../types/schedule';

export const setUserInfo = (payload: Partial<Pick<UserState, UserInfoKeys>>): SetUserInfoAction => ({
  type: UserActions.SET_USER_INFO,
  payload,
});

export const setUserSchedule = (payload: Schedule): SetUserScheduleAction => ({
  type: UserActions.SET_USER_SCHEDULE,
  payload,
});

export const addSchedule = (payload: Schedule): AddScheduleAction => ({
  type: UserActions.ADD_SCHEDULE,
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

export const logOut = (): LogOutAction => ({
  type: MiscellaneousActions.LOG_OUT,
});
