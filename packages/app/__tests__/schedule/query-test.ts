import { isSameMinute, addMinutes } from 'date-fns';

import {
  isHalfMod, containsDate, getScheduleTypeOnDate, convertTimeToDate, getModAtTime, getClassAtMod,
  getModNameFromModNumber, getSchoolYearFromDate, getScheduleInfoAtTime, getCountdown,
} from '../../src/utils/query-schedule';
import { DatesState } from '../../src/types/store';
import * as SCHEDULES from '../../src/constants/schedules';
import { ModNumber, RawSchedule, ClassItem, CrossSectionedItem } from '../../src/types/schedule';
import { processSchedule, convertToClassItem } from '../../src/utils/process-schedule';
import rawSchedule from './test-schedules/raw.json';

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

    it('should return AFTER_SCHOOL', () => {
      [SCHEDULES.REGULAR, SCHEDULES.LATE_START, SCHEDULES.ASSEMBLY].forEach((schedule) => {
        expect(getModAtTime(new Date(2019, 10, 1, 15, 15), schedule)).toStrictEqual({
          current: ModNumber.AFTER_SCHOOL, next: ModNumber.AFTER_SCHOOL,
        });
      });

      [SCHEDULES.WEDNESDAY, SCHEDULES.LATE_START_WEDNESDAY].forEach((schedule) => {
        expect(getModAtTime(new Date(2019, 10, 1, 14, 55), schedule)).toStrictEqual({
          current: ModNumber.AFTER_SCHOOL, next: ModNumber.AFTER_SCHOOL,
        });
      });

      expect(getModAtTime(new Date(2019, 10, 1, 13, 15), SCHEDULES.EARLY_DISMISSAL)).toStrictEqual({
        current: ModNumber.AFTER_SCHOOL, next: ModNumber.AFTER_SCHOOL,
      });
      expect(getModAtTime(new Date(2019, 10, 1, 12, 30), SCHEDULES.FINALS)).toStrictEqual({
        current: ModNumber.AFTER_SCHOOL, next: ModNumber.AFTER_SCHOOL,
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
          const lastPair = modNumber === ModNumber.FOURTEEN;
          return current === modNumber && next === (lastPair ? ModNumber.AFTER_SCHOOL : ModNumber.PASSING_PERIOD);
        });
        expect(returnsMod).toBe(true);
      }
    });

    it('returns UNKNOWN for schedules without timepairs', () => {
      [SCHEDULES.BREAK, SCHEDULES.SUMMER, SCHEDULES.WEEKEND].forEach((schedule) => {
        expect(getModAtTime(new Date(), schedule)).toStrictEqual({
          current: ModNumber.UNKNOWN, next: ModNumber.UNKNOWN,
        });
      });
    });
  });

  describe('getClassAtMod', () => {
    const schedule: RawSchedule = [
      {
        sourceId: 1,
        sourceType: 'course',
        title: 'Test',
        body: 'Test Body',
        roomNumber: 'Body',
        day: 3,
        startMod: 3,
        length: 3,
        endMod: 6,
        sectionNumber: 1,
        phaseNumber: 1,
        data: null,
      },
      {
        sourceId: 2,
        sourceType: 'course',
        title: 'Test 2',
        body: 'Test Body 2',
        roomNumber: 'Body 2',
        day: 3,
        startMod: 6,
        length: 2,
        endMod: 8,
        sectionNumber: 1,
        phaseNumber: 1,
        data: null,
      },
      {
        sourceId: 3,
        sourceType: 'course',
        title: 'Test 3',
        body: 'Test Body 3',
        roomNumber: 'Body 3',
        day: 1,
        startMod: 6,
        length: 2,
        endMod: 8,
        sectionNumber: 1,
        phaseNumber: 1,
        data: null,
      },
      {
        sourceId: 4,
        sourceType: 'course',
        title: 'Test 4-1',
        body: 'Test Body 4-1',
        roomNumber: 'Body 4-1',
        day: 2,
        startMod: 6,
        length: 2,
        endMod: 8,
        sectionNumber: 1,
        phaseNumber: 1,
        data: null,
      },
      {
        sourceId: 5,
        sourceType: 'course',
        title: 'Test 4-2',
        body: 'Test Body 4-2',
        roomNumber: 'Body 4-2',
        day: 2,
        startMod: 6,
        length: 2,
        endMod: 8,
        sectionNumber: 1,
        phaseNumber: 1,
        data: null,
      },
    ];
    const processed = processSchedule(schedule);

    it('selects correct schedule depending on day', () => {
      expect((getClassAtMod(ModNumber.THREE, processed[2]) as ClassItem).title).toBe('Test');
      expect((getClassAtMod(ModNumber.SIX, processed[0]) as ClassItem).title).toBe('Test 3');
    });

    it('returns correct for in-between mods', () => {
      expect((getClassAtMod(ModNumber.FIVE, processed[2]) as ClassItem).title).toBe('Test');
      expect((getClassAtMod(ModNumber.SEVEN, processed[2]) as ClassItem).title).toBe('Test 2');
      expect((getClassAtMod(ModNumber.SEVEN, processed[0]) as ClassItem).title).toBe('Test 3');
    });

    it('returns correct for open mods', () => {
      expect((getClassAtMod(ModNumber.TWO, processed[3]) as ClassItem).title).toBe('Open Mod');
      expect((getClassAtMod(ModNumber.NINE, processed[3]) as ClassItem).title).toBe('Open Mod');
      expect((getClassAtMod(ModNumber.FIVE, processed[1]) as ClassItem).title).toBe('Open Mod');
    });

    it('returns correct for cross-sectioned mod', () => {
      const [, , , third, fourth] = schedule.map(convertToClassItem);
      expect((getClassAtMod(ModNumber.SEVEN, processed[1]) as CrossSectionedItem).columns).toStrictEqual(
        [[third], [fourth]],
      );
    });

    it.todo('returns correct for finals');

    it.todo('returns correct for assembly');

    it('returns null instead of undefined if not found', () => {
      expect(getClassAtMod(ModNumber.BEFORE_SCHOOL, processed[2])).toBe(null);
      expect(getClassAtMod(ModNumber.AFTER_SCHOOL, processed[2])).toBe(null);
    });

    it('returns null for empty schedule', () => {
      expect(getClassAtMod(ModNumber.ONE, [][2])).toBe(null);
    });
  });

  describe('getScheduleInfoAtTime', () => {
    const schedule = processSchedule(rawSchedule.monday);
    const [[homeroom, open]] = schedule;
    const getInfo = (date: Date) => getScheduleInfoAtTime(date, SCHEDULES.REGULAR, schedule);

    it('returns correct for current: BEFORE_SCHOOL, next: CLASS', () => {
      expect(getInfo(new Date(2019, 4, 6, 7, 55))).toStrictEqual({
        current: ModNumber.BEFORE_SCHOOL, next: ModNumber.HOMEROOM, currentClass: null, nextClass: homeroom,
      });
    });

    it('returns correct for current: CLASS, next: PASSING_PERIOD', () => {
      expect(getInfo(new Date(2019, 4, 6, 8, 10))).toStrictEqual({
        current: ModNumber.HOMEROOM, next: ModNumber.PASSING_PERIOD, currentClass: homeroom, nextClass: open,
      });
    });

    it('returns correct for current: PASSING_PERIOD, next: CLASS', () => {
      expect(getInfo(new Date(2019, 4, 6, 8, 16))).toStrictEqual({
        current: ModNumber.PASSING_PERIOD, next: ModNumber.ONE, currentClass: null, nextClass: open,
      });
    });

    it('returns correct for current: CLASS, next: AFTER_SCHOOL', () => {
      expect(getInfo(new Date(2019, 4, 6, 15, 5))).toStrictEqual({
        current: ModNumber.FOURTEEN, next: ModNumber.AFTER_SCHOOL,
        currentClass: schedule[0].slice(-1)[0], nextClass: null,
      });
    });

    it('returns correct for current: AFTER_SCHOOL, next: AFTER_SCHOOL', () => {
      expect(getInfo(new Date(2019, 4, 6, 15, 15))).toStrictEqual({
        current: ModNumber.AFTER_SCHOOL, next: ModNumber.AFTER_SCHOOL, currentClass: null, nextClass: null,
      });
    });
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

  describe('getScheduleTypeOnDate', () => {
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
    const getSchedule = (date: Date) => SCHEDULES[getScheduleTypeOnDate(date, mockDates)];

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

    it('returns WEEKEND for weekends', () => {
      expect(getSchedule(new Date(2019, 8, 28))).toBe(SCHEDULES.WEEKEND);
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
    it('returns 0 if after school', () => {
      const mockScheduleInfo = {
        current: ModNumber.AFTER_SCHOOL, next: ModNumber.AFTER_SCHOOL,
        currentClass: null, nextClass: null,
      };
      expect(getCountdown(convertTimeToDate('16:10'), mockScheduleInfo, SCHEDULES.REGULAR)).toBe(0);
    });

    it('returns seconds until current mod ends if next is PASSING_PERIOD', () => {
      const mockScheduleInfo = {
        current: ModNumber.THIRTEEN, next: ModNumber.PASSING_PERIOD,
        currentClass: null, nextClass: null,
      };
      expect(getCountdown(convertTimeToDate('14:29'), mockScheduleInfo, SCHEDULES.REGULAR)).toBe(60);
    });

    it('returns seconds until current mod ends if next is AFTER_SCHOOL', () => {
      const mockScheduleInfo = {
        current: ModNumber.FOURTEEN, next: ModNumber.AFTER_SCHOOL,
        currentClass: null, nextClass: null,
      };
      expect(getCountdown(convertTimeToDate('15:09'), mockScheduleInfo, SCHEDULES.REGULAR)).toBe(60);
    });

    it('returns seconds until next mod start', () => {
      const mockScheduleInfo = {
        current: ModNumber.PASSING_PERIOD, next: ModNumber.FOURTEEN,
        currentClass: null, nextClass: null,
      };
      expect(getCountdown(convertTimeToDate('14:34'), mockScheduleInfo, SCHEDULES.REGULAR)).toBe(60);
    });
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
      for (let finalsMod = ModNumber.FINALS_ONE; finalsMod <= ModNumber.FINALS_FOUR; finalsMod++) {
        expect(isHalfMod(finalsMod)).toBe(false);
      }
    });
  });

  describe('getModNameFromModNumber', () => {
    it('returns Homeroom for HOMEROOM', () => {
      expect(getModNameFromModNumber(ModNumber.HOMEROOM)).toBe('Homeroom');
    });

    it('returns Assembly for ASSEMBLY', () => {
      expect(getModNameFromModNumber(ModNumber.ASSEMBLY)).toBe('Assembly');
    });

    const finalsOrdinals = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th'];
    it('returns ordinal for FINALS', () => {
      for (let modNumber = ModNumber.FINALS_ONE, i = 0; modNumber <= ModNumber.FINALS_FOUR; modNumber++, i++) {
        expect(getModNameFromModNumber(modNumber)).toBe(`${finalsOrdinals[i]} Final`);
      }
    });

    it('returns mod for less than ASSEMBLY', () => {
      expect(getModNameFromModNumber(ModNumber.THREE)).toBe('3');
    });

    it('returns mod - 1 for greater than ASSEMBLY', () => {
      expect(getModNameFromModNumber(ModNumber.FOUR)).toBe('4');
    });
  });

  describe('getSchoolYearFromDate', () => {
    it('handles August', () => {
      expect(getSchoolYearFromDate(new Date(2019, 7))).toBe(2019);
    });

    it('handles December', () => {
      expect(getSchoolYearFromDate(new Date(2019, 11))).toBe(2019);
    });

    it('handles subsequent year', () => {
      expect(getSchoolYearFromDate(new Date(2020, 1))).toBe(2019);
    });

    it('handles subsequent year May', () => {
      expect(getSchoolYearFromDate(new Date(2020, 4))).toBe(2019);
    });

    it('handles subsequent year June', () => {
      expect(getSchoolYearFromDate(new Date(2020, 5))).toBe(2020);
    });
  });
});
