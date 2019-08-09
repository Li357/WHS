import * as creators from '../../src/actions/creators';
import {
  UserActions, DayActions, MiscellaneousActions, ThemeActions, Theme, DatesActions, DayScheduleType,
} from '../../src/types/store';
import { Schedule, TeacherSchedule } from '../../src/types/schedule';
import { initialDatesState } from '../../src/constants/store';

describe('action creators', () => {
  it('should create action to set user credentials', () => {
    const payload = {
      username: 'John',
      password: '1234',
    };
    const expectedAction = {
      type: UserActions.SET_USER_CREDENTIALS,
      payload,
    };
    expect(creators.setUserCredentials(payload)).toEqual(expectedAction);
  });

  it('should create action to set user info', () => {
    const payload = {
      homeroom: 'John Smith',
      counselor: 'John Smith',
    };
    const expectedAction = {
      type: UserActions.SET_USER_INFO,
      payload,
    };
    expect(creators.setUserInfo(payload)).toEqual(expectedAction);
  });

  it('should create action to set user schedule', () => {
    const payload: Schedule = [];
    const expectedAction = {
      type: UserActions.SET_USER_SCHEDULE,
      payload,
    };
    expect(creators.setUserSchedule(payload)).toEqual(expectedAction);
  });

  it('should create action to set teacher schedules', () => {
    const payload: TeacherSchedule[] = [{
      url: 'https://example.com',
      name: 'Bob Johnson',
      schedule: [],
    }];
    const expectedAction = {
      type: UserActions.SET_TEACHER_SCHEDULES,
      payload,
    };
    expect(creators.setTeacherSchedules(payload)).toEqual(expectedAction);
  });

  it('should create action to add teacher schedule', () => {
    const payload: TeacherSchedule = {
      url: 'https://example.com',
      name: 'Bob Johnson',
      schedule: [],
    };
    const expectedAction = {
      type: UserActions.ADD_TEACHER_SCHEDULE,
      payload,
    };
    expect(creators.addTeacherSchedule(payload)).toEqual(expectedAction);
  });

  it('should create action to set day schedule', () => {
    const payload: DayScheduleType = 'REGULAR';
    const expectedAction = {
      type: DayActions.SET_DAY_SCHEDULE,
      payload,
    };
    expect(creators.setDaySchedule(payload)).toEqual(expectedAction);
  });

  it('should create action to set refreshed', () => {
    const payload: [boolean, boolean] = [true, false];
    const expectedAction = {
      type: DayActions.SET_REFRESHED,
      payload,
    };
    expect(creators.setRefreshed(payload)).toEqual(expectedAction);
  });

  it('should create action to set theme', () => {
    const payload = Theme.DARK;
    const expectedAction = {
      type: ThemeActions.SET_THEME,
      payload,
    };
    expect(creators.setTheme(payload)).toEqual(expectedAction);
  });

  it('should create action to set dates', () => {
    const payload = { ...initialDatesState, noSchool: [new Date()] };
    const expectedAction = {
      type: DatesActions.SET_DATES,
      payload,
    };
    expect(creators.setDates(payload)).toEqual(expectedAction);
  });

  it('should create action to log out', () => {
    const expectedAction = {
      type: MiscellaneousActions.LOG_OUT,
    };
    expect(creators.logOut()).toEqual(expectedAction);
  });

  it('should create other action', () => {
    const expectedAction = {
      type: MiscellaneousActions.OTHER,
    };
    expect(creators.other()).toEqual(expectedAction);
  });
});
