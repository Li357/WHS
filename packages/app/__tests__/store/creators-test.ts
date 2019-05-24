import * as creators from '../../src/actions/creators';
import { UserActions, DayActions, MiscellaneousActions } from '../../src/types/store';
import { Schedule, DaySchedule } from '../../src/types/schedule';

describe('action creators', () => {
  it('should create action to set user info', () => {
    const payload = {
      username: 'John',
      password: '1234',
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

  it('should create action to add a schedule', () => {
    const payload: Schedule = [];
    const expectedAction = {
      type: UserActions.ADD_SCHEDULE,
      payload,
    };
    expect(creators.addSchedule(payload)).toEqual(expectedAction);
  });

  it('should create action to set day info', () => {
    const payload = {
      isBreak: true,
      isSummer: true,
    };
    const expectedAction = {
      type: DayActions.SET_DAY_INFO,
      payload,
    };
    expect(creators.setDayInfo(payload)).toEqual(expectedAction);
  });

  it('should create action to set day schedule', () => {
    const payload: DaySchedule = [];
    const expectedAction = {
      type: DayActions.SET_DAY_SCHEDULE,
      payload,
    };
    expect(creators.setDaySchedule(payload)).toEqual(expectedAction);
  });

  it('should create action to log out', () => {
    const expectedAction = {
      type: MiscellaneousActions.LOG_OUT,
    };
    expect(creators.logOut()).toEqual(expectedAction);
  });
});
