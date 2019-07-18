import { isSameMinute, addMinutes } from 'date-fns';

import {
  isHalfMod, containsDate, getScheduleOnDate, convertTimeToDate, getModAtTime,
} from '../../src/utils/query-schedule';
import { DatesState } from '../../src/types/store';
import * as SCHEDULES from '../../src/constants/schedules';
import { ModNumber } from '../../src/types/schedule';

describe('schedule querying', () => {
  describe('convertTimeToDate', () => {
    it('should return date based on time', () => {
      const am = convertTimeToDate('8:00', new Date(2019, 10, 1));
      expect(isSameMinute(am, new Date(2019, 10, 1, 8, 0))).toBe(true);

      const pm = convertTimeToDate('15:35', new Date(2019, 10, 1));
      expect(isSameMinute(pm, new Date(2019, 10, 1, 15, 35)));
    });
  });

  describe('getModAtTime', () => {
    it('should return BEFORE_SCHOOL and HOMEROOM', () => {
      [
        SCHEDULES.REGULAR,
        SCHEDULES.EARLY_DISMISSAL, SCHEDULES.ASSEMBLY, SCHEDULES.FINALS,
      ].forEach((schedule) => {
        expect(getModAtTime(new Date(2019, 10, 1, 7, 55), schedule)).toStrictEqual({
          current: ModNumber.BEFORE_SCHOOL, next: ModNumber.HOMEROOM,
        });
      });

      expect(getModAtTime(new Date(2019, 10, 1, 7, 55), SCHEDULES.WEDNESDAY)).toStrictEqual({
        current: ModNumber.BEFORE_SCHOOL, next: ModNumber.ONE,
      });
      expect(getModAtTime(new Date(2019, 10, 1, 9, 55), SCHEDULES.LATE_START_WEDNESDAY)).toStrictEqual({
        current: ModNumber.BEFORE_SCHOOL, next: ModNumber.ONE,
      });
    });

    it('should return AFTER_SCHOOL and null', () => {
      [SCHEDULES.REGULAR, SCHEDULES.LATE_START, SCHEDULES.ASSEMBLY].forEach((schedule) => {
        expect(getModAtTime(new Date(2019, 10, 1, 15, 15), schedule)).toStrictEqual({
          current: ModNumber.AFTER_SCHOOL, next: null,
        });
      });

      [SCHEDULES.WEDNESDAY, SCHEDULES.LATE_START_WEDNESDAY].forEach((schedule) => {
        expect(getModAtTime(new Date(2019, 10, 1, 14, 55), schedule)).toStrictEqual({
          current: ModNumber.AFTER_SCHOOL, next: null,
        });
      });

      expect(getModAtTime(new Date(2019, 10, 1, 13, 15), SCHEDULES.EARLY_DISMISSAL)).toStrictEqual({
        current: ModNumber.AFTER_SCHOOL, next: null,
      });
      expect(getModAtTime(new Date(2019, 10, 1, 12, 30), SCHEDULES.FINALS)).toStrictEqual({
        current: ModNumber.AFTER_SCHOOL, next: null,
      });
    });

    it('should return PASSING_PERIOD', () => {
      for (const schedule of Object.values(SCHEDULES)) {
        // Don't check after school
        const returnsPassingPeriod = schedule.slice(0, -1).every((triplet, index) => {
          const endTime = triplet[1];
          // 2 minutes after the end of a mod should be passing period
          const date = addMinutes(convertTimeToDate(endTime), 2);
          const { current, next } = getModAtTime(date, schedule);
          return current === ModNumber.PASSING_PERIOD && next === schedule[index + 1][2];
        });
        expect(returnsPassingPeriod).toBe(true);
      }
    });

    it('should return corresponding mod', () => {
      for (const schedule of Object.values(SCHEDULES)) {
        const returnsMod = schedule.every(([startTime, endTime, modNumber], index) => {
          const [start, end] = [startTime, endTime].map((time) => (
            Number(convertTimeToDate(time))
          ));
          const middle = new Date((start + end) / 2);
          const { current, next } = getModAtTime(middle, schedule);
          const lastPair = index === schedule.length;
          return current === modNumber && next === (lastPair ? ModNumber.AFTER_SCHOOL : ModNumber.PASSING_PERIOD);
        });
        expect(returnsMod).toBe(true);
      }
    });
  });

  describe('getClassAtMod', () => {
    it.todo('');
  });

  describe('getScheduleInfoAtTime', () => {
    it.todo('');
  });

  describe('containsDate', () => {
    const dummyDates = [
      new Date(2019, 10, 10, 10, 10, 10, 10),
      new Date(2019, 2, 30, 1, 1, 1, 1),
      new Date(2019, 2, 30, 2, 2, 2, 2),
    ];

    it('should return false on empty array', () => {
      expect(containsDate(dummyDates[0], [])).toBe(false);
    });

    it('should return true based on just day', () => {
      expect(containsDate(dummyDates[2], dummyDates.slice(0, 2))).toBe(true);
    });

    it('should return false if array does not contain date', () => {
      expect(containsDate(dummyDates[1], [dummyDates[0]])).toBe(false);
    });
  });

  describe('getScheduleOnDate', () => {
    const mockDates: DatesState = {
      assembly: [new Date(2020, 3, 6)],
      noSchool: [new Date(2019, 11, 23), new Date(2019, 11, 24)],
      earlyDismissal: [new Date(2019, 8, 4), new Date(2019, 10, 11)],
      lateStart: [new Date(2019, 8, 25), new Date(2019, 10, 1)],
      semesterOneStart: new Date(2019, 7, 14),
      semesterOneEnd: new Date(2019, 11, 22),
      semesterTwoStart: new Date(2020, 0, 5),
      semesterTwoEnd: new Date(2020, 4, 22),
    };
    const getSchedule = (date: Date) => getScheduleOnDate(date, mockDates);

    it.todo('returns BREAK schedule for summer');

    it('returns FINALS schedule for both dates from both semesters', () => {
      const semOneFirst = getSchedule(new Date(2019, 11, 21));
      expect(semOneFirst).toBe(SCHEDULES.FINALS);

      const semOneSecond = getSchedule(new Date(2019, 11, 21));
      expect(semOneSecond).toBe(SCHEDULES.FINALS);

      const semTwoFirst = getSchedule(new Date(2020, 4, 21));
      expect(semTwoFirst).toBe(SCHEDULES.FINALS);

      const semTwoSecond = getSchedule(new Date(2020, 4, 22));
      expect(semTwoSecond).toBe(SCHEDULES.FINALS);
    });

    it('returns BREAK schedule for no school dates', () => {
      const one = getSchedule(new Date(2019, 11, 23));
      expect(one).toBe(SCHEDULES.BREAK);

      const two = getSchedule(new Date(2019, 11, 24));
      expect(two).toBe(SCHEDULES.BREAK);
    });

    it('returns EARLY_DISMISSAL schedule for early dismissals', () => {
      const one = getSchedule(new Date(2019, 8, 4));
      expect(one).toBe(SCHEDULES.EARLY_DISMISSAL);

      const two = getSchedule(new Date(2019, 10, 11));
      expect(two).toBe(SCHEDULES.EARLY_DISMISSAL);
    });

    it('returns ASSEMBLY schedule for assemblies', () => {
      const schedule = getSchedule(new Date(2020, 3, 6));
      expect(schedule).toBe(SCHEDULES.ASSEMBLY);
    });

    it('returns LATE_START_WEDNESDAY for late start on wednesday', () => {
      const schedule = getSchedule(new Date(2019, 8, 25));
      expect(schedule).toBe(SCHEDULES.LATE_START_WEDNESDAY);
    });

    it('returns LATE_START for lates starts', () => {
      const schedule = getSchedule(new Date(2019, 10, 1));
      expect(schedule).toBe(SCHEDULES.LATE_START);
    });

    it('returns WEDNESDAY for wednesdays', () => {
      const schedule = getSchedule(new Date(2019, 8, 18));
      expect(schedule).toBe(SCHEDULES.WEDNESDAY);
    });

    it('returns REGULAR schedule otherwise', () => {
      const schedule = getSchedule(new Date(2019, 8, 19));
      expect(schedule).toBe(SCHEDULES.REGULAR);
    });
  });

  describe('getCountdown', () => {
    it.todo('');
  });

  describe('isHalfMod', () => {
    it('returns true for >=Mod 4 and <=Mod 11', () => {
      expect(isHalfMod(ModNumber.FOUR)).toBe(true);
      expect(isHalfMod(ModNumber.ELEVEN)).toBe(true);
    });

    it('returns false for <=3 or >=12', () => {
      expect(isHalfMod(ModNumber.THREE)).toBe(false);
      expect(isHalfMod(ModNumber.TWELVE)).toBe(false);
    });

    it('returns false for assembly', () => {
      expect(isHalfMod(ModNumber.ASSEMBLY)).toBe(false);
    });

    it('returns false for finals', () => {
      expect(isHalfMod(ModNumber.FINALS)).toBe(false);
    });
  });
});
