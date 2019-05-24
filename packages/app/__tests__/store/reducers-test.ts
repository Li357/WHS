import userReducer, { initialUserState } from '../../src/reducers/user';
import dayReducer, { initialDayState } from '../../src/reducers/day';
import rootReducer from '../../src/reducers/root';
import { MiscellaneousActions, OtherAction, AppState } from '../../src/types/store';
import * as creators from '../../src/actions/creators';
import { DaySchedule, ModNumber, Schedule } from '../../src/types/schedule';

describe('reducers', () => {
  const dummyAction: OtherAction = { type: MiscellaneousActions.OTHER };
  const dummySchedule: Schedule = Array(5).fill([{
    sourceId: 1000,
    sourceType: 'course',
    title: 'Test',
    body: 'Test Course',
    roomNumber: 'Rm. 138',
    sectionNumber: 5,
    phaseNumber: 5,
    day: 5,
    startMod: 1,
    length: 1,
    endMod: 2,
    data: null,
  }]);
  const dummyDaySchedule: DaySchedule = [['8:00', '8:15', ModNumber.HOMEROOM]];

  describe('user', () => {
    it('should return initial state', () => {
      expect(userReducer(undefined, dummyAction)).toEqual(initialUserState);
      expect(userReducer(initialUserState, dummyAction)).toEqual(initialUserState);
    });

    it('should handle SET_USER_INFO', () => {
      const update = {
        username: 'John',
        password: '1234',
        name: 'John Smith',
      };
      const expectedState = {
        ...initialUserState,
        ...update,
      };

      expect(userReducer(
        initialUserState,
        creators.setUserInfo(update),
      )).toEqual(expectedState);
    });

    it('should handle SET_USER_SCHEDULE', () => {
      const expectedState = {
        ...initialUserState,
        schedule: dummySchedule,
      };

      expect(userReducer(
        initialUserState,
        creators.setUserSchedule(dummySchedule),
      )).toEqual(expectedState);
    });

    it('should handle ADD_SCHEDULE', () => {
      const expectedState = {
        ...initialUserState,
        addedSchedules: [dummySchedule],
      };

      expect(userReducer(
        initialUserState,
        creators.addSchedule(dummySchedule),
      )).toEqual(expectedState);
    });
  });

  describe('day', () => {
    it('should return initial state', () => {
      expect(dayReducer(undefined, dummyAction)).toEqual(initialDayState);
      expect(dayReducer(initialDayState, dummyAction)).toEqual(initialDayState);
    });

    it('should handle SET_DAY_INFO', () => {
      const update = {
        isBreak: false,
        hasAssembly: true,
      };
      const expectedState = {
        ...initialDayState,
        ...update,
      };

      expect(dayReducer(
        initialDayState,
        creators.setDayInfo(update),
      )).toEqual(expectedState);
    });

    it('should handle SET_DAY_SCHEDULE', () => {
      const expectedState = {
        ...initialDayState,
        daySchedule: dummyDaySchedule,
      };

      expect(dayReducer(
        initialDayState,
        creators.setDaySchedule(dummyDaySchedule),
      )).toEqual(expectedState);
    });
  });

  describe('root', () => {
    const initialAppState: AppState = {
      user: initialUserState,
      day: initialDayState,
    };

    it('should return initial state', () => {
      expect(rootReducer(undefined, dummyAction)).toEqual(initialAppState);
    });

    it('should handle LOG_OUT', () => {
      const dummyAppState: AppState = {
        user: {
          ...initialUserState,
          username: 'John',
          password: '1234',
          name: 'John Smith',
          schedule: dummySchedule,
        },
        day: {
          daySchedule: dummyDaySchedule,
          isBreak: false,
          isFinals: true,
          hasAssembly: false,
          lastStateUpdate: new Date(),
        },
      };
      expect(rootReducer(dummyAppState, creators.logOut())).toEqual(initialAppState);
    });
  });
});
