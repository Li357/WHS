import userReducer from '../../src/reducers/user';
import dayReducer from '../../src/reducers/day';
import themeReducer from '../../src/reducers/theme';
import rootReducer from '../../src/reducers/root';
import datesReducer from '../../src/reducers/dates';
import { initialUserState, initialDayState, initialDatesState } from '../../src/constants/store';
import { lightTheme, darkTheme } from '../../src/constants/theme';
import * as creators from '../../src/actions/creators';
import { MiscellaneousActions, OtherAction, AppState, Theme } from '../../src/types/store';
import { DaySchedule, ModNumber, Schedule, TeacherSchedule } from '../../src/types/schedule';

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
  const dummyTeacherSchedule: TeacherSchedule = {
    url: 'https://example.com',
    name: 'Bob Johnson',
    schedule: dummySchedule,
  };
  const dummyDaySchedule: DaySchedule = [['8:00', '8:15', ModNumber.HOMEROOM]];

  describe('user', () => {
    it('should return initial state', () => {
      expect(userReducer(undefined, dummyAction)).toEqual(initialUserState);
      expect(userReducer(initialUserState, dummyAction)).toEqual(initialUserState);
      expect(userReducer(initialUserState, creators.other())).toEqual(initialUserState);
    });

    it('should handle SET_USER_CREDENTIALS', () => {
      const update = {
        username: 'John',
        password: '1234',
      };
      const expectedState = {
        ...initialUserState,
        ...update,
      };

      expect(userReducer(
        initialUserState,
        creators.setUserCredentials(update),
      )).toEqual(expectedState);
    });

    it('should handle SET_USER_INFO', () => {
      const update = {
        name: 'John Smith',
        homeroom: 'John Smith',
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

    it('should handle SET_TEACHER_SCHEDULES', () => {
      const expectedState = {
        ...initialUserState,
        teacherSchedules: [dummyTeacherSchedule],
      };

      expect(userReducer(
        initialUserState,
        creators.setTeacherSchedules([dummyTeacherSchedule]),
      )).toEqual(expectedState);
    });

    it('should handle ADD_TEACHER_SCHEDULE', () => {
      const expectedState = {
        ...initialUserState,
        teacherSchedules: [dummyTeacherSchedule],
      };

      expect(userReducer(
        initialUserState,
        creators.addTeacherSchedule(dummyTeacherSchedule),
      )).toEqual(expectedState);
    });
  });

  describe('day', () => {
    it('should return initial state', () => {
      expect(dayReducer(undefined, dummyAction)).toEqual(initialDayState);
      expect(dayReducer(initialDayState, dummyAction)).toEqual(initialDayState);
      expect(dayReducer(initialDayState, creators.other())).toEqual(initialDayState);
    });

    it('should handle UPDATE_DAY_STATE', () => {
      const update = new Date();
      const expectedState = {
        ...initialDayState,
        ...update,
      };

      expect(dayReducer(
        initialDayState,
        creators.updateDayState(update),
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

  describe('theme', () => {
    it('should return initial state', () => {
      expect(themeReducer(undefined, dummyAction)).toEqual(lightTheme);
      expect(themeReducer(lightTheme, dummyAction)).toEqual(lightTheme);
      expect(themeReducer(darkTheme, creators.other())).toEqual(darkTheme);
    });

    it('should handle SET_THEME', () => {
      expect(themeReducer(lightTheme, creators.setTheme(Theme.DARK))).toEqual(darkTheme);
      expect(themeReducer(darkTheme, creators.setTheme(Theme.DARK))).toEqual(darkTheme);
    });
  });

  describe('dates', () => {
    const dummyDates = { ...initialDatesState, noSchool: [new Date()] };

    it('should return initial state', () => {
      expect(datesReducer(undefined, dummyAction)).toEqual(initialDatesState);
      expect(datesReducer(initialDatesState, dummyAction)).toEqual(initialDatesState);
      expect(datesReducer(dummyDates, creators.other())).toEqual(dummyDates);
    });

    it('should handle SET_DATES', () => {
      expect(datesReducer(initialDatesState, creators.setDates(dummyDates))).toEqual(dummyDates);
      expect(datesReducer(dummyDates, creators.setDates(dummyDates))).toEqual(dummyDates);
    });
  });

  describe('root', () => {
    const initialAppState: AppState = {
      user: initialUserState,
      day: initialDayState,
      theme: lightTheme,
      dates: initialDatesState,
    };

    it('should return initial state', () => {
      expect(rootReducer(undefined, dummyAction)).toEqual(initialAppState);
      expect(rootReducer(initialAppState, creators.other())).toEqual(initialAppState);
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
          schedule: dummyDaySchedule,
          lastStateUpdate: new Date(),
        },
        theme: darkTheme,
        dates: {
          ...initialDatesState,
          noSchool: [new Date()],
        },
      };
      expect(rootReducer(dummyAppState, creators.logOut())).toEqual(initialAppState);
    });
  });
});
