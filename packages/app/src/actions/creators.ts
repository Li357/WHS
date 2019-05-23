import {
  UserActions, UserState, SetUserInfoAction, UserInfoKeys, SetUserScheduleAction,
  DayState, DayActions, DayInfoKeys,
  MiscellaneousActions,
} from '../types/store';
import { Schedule, DaySchedule } from '../types/schedule';

export const setUserInfo = (payload: Pick<UserState, UserInfoKeys>): SetUserInfoAction => ({
  // tslint:disable-next-line: object-literal-sort-keys
  type: UserActions.SET_USER_INFO,
  payload,
});

export const setUserSchedule = (payload: Schedule): SetUserScheduleAction => ({
  // tslint:disable-next-line: object-literal-sort-keys
  type: UserActions.SET_USER_SCHEDULE,
  payload,
});

export const addSchedule = (payload: Schedule[]) => ({
  type: UserActions.ADD_SCHEDULE,
  payload,
});

export const setDayInfo = (payload: Pick<DayState, DayInfoKeys>) => ({
  type: DayActions.SET_DAY_INFO,
  payload,
});

export const setDaySchedule = (payload: DaySchedule) => ({
  type: DayActions.SET_DAY_SCHEDULE,
  payload,
});

export const logOut = () => ({
  type: MiscellaneousActions.LOG_OUT,
});
