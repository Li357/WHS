import {
  generateSourceId, createCrossSectionedItem, createOpenItem,
  interpolateCrossSectionedItems,
  interpolateOpenItems,
  processSchedule,
  convertToClassItem,
  interpolateAssembly,
  createClassItem,
  splitClassItem,
  getFinalsSchedule,
} from '../../src/utils/process-schedule';
import { ClassItem, ScheduleItem, RawSchedule, RawClassItem, ModNumber } from '../../src/types/schedule';
import crossSectionedSchedules from './test-schedules/cross-sectioned.json';
import openSchedules from './test-schedules/open.json';
import rawSchedules from './test-schedules/raw.json';
import assemblySchedules from './test-schedules/assembly.json';
import { getModNameFromModNumber } from '../../src/utils/query-schedule';

describe('schedule processing', () => {
  const createOpenDay = (day: number) => [createOpenItem(day === 3 ? 1 : 0, 15, day)];

  describe('utility functions', () => {
    it('should generate expected sourceId', () => {
      expect(generateSourceId(1, 10, 3)).toEqual(30110000);
    });

    it('should create cross-sectioned item', () => {
      const dummyScheduleItem = {
        sourceId: 123456,
        sourceType: 'course',
        title: 'Test',
        body: '',
        day: 1,
        startMod: 1,
        length: 1,
        endMod: 2,
      };
      const dummyColumns = Array(2).fill([dummyScheduleItem]);
      expect(createCrossSectionedItem(dummyColumns, 1, 2, 1)).toEqual({
        sourceId: 10102000,
        columns: dummyColumns,
        day: 1,
        startMod: 1,
        length: 1,
        endMod: 2,
      });
    });

    it('should create open item', () => {
      expect(createOpenItem(1, 2, 1)).toEqual({
        sourceId: 10102000,
        sourceType: 'open',
        title: 'Open Mod',
        body: '',
        day: 1,
        startMod: 1,
        length: 1,
        endMod: 2,
      });
    });
  });

  describe('interpolators', () => {
    describe('interpolateCrossSectionedItems', () => {
      const schedules: Record<string, ClassItem[]> = crossSectionedSchedules;
      const {
        none, single, double, oneAndTwoHalves, consecutive,
        nonConsecutive, nonConsecutiveWithBetween, partialOverlap, duplicates,
      } = schedules;

      const flankWithClassItems = (withCrossSections: ClassItem[]) => {
        const [first] = withCrossSections;
        const [last] = withCrossSections.slice(-1);
        return [
          { ...first, startMod: first.startMod - 1, length: 1, endMod: first.startMod },
          ...withCrossSections,
          { ...last, startMod: last.endMod, length: 1, endMod: last.endMod + 1 },
        ];
      };

      it('ignores empty schedule', () => {
        expect(interpolateCrossSectionedItems([], 1)).toEqual([]);
      });

      it('ignores schedule without cross-sections', () => {
        expect(interpolateCrossSectionedItems(none, none[0].day)).toEqual(none);
      });

      it('handles single cross-section', () => {
        const [first, second] = single;
        expect(interpolateCrossSectionedItems(single, first.day)).toEqual([
          createCrossSectionedItem([[first], [second]], first.startMod, second.endMod, first.day),
        ]);

        const flanked = flankWithClassItems(single);
        const [firstFlank, , , secondFlank] = flanked;
        expect(interpolateCrossSectionedItems(flanked, first.day)).toEqual([
          firstFlank,
          createCrossSectionedItem([[first], [second]], first.startMod, second.endMod, first.day),
          secondFlank,
        ]);
      });

      it('handles double cross-section', () => {
        const [first, second, third] = double;
        expect(interpolateCrossSectionedItems(double, first.day)).toEqual([
          createCrossSectionedItem([[first], [second], [third]], first.startMod, third.endMod, first.day),
        ]);

        const flanked = flankWithClassItems(double);
        const [firstFlank, , , , secondFlank] = flanked;
        expect(interpolateCrossSectionedItems(flanked, first.day)).toEqual([
          firstFlank,
          createCrossSectionedItem([[first], [second], [third]], first.startMod, third.endMod, first.day),
          secondFlank,
        ]);
      });

      it('handles one and two half mods', () => {
        // order here matters to guarantee same sort order: first by startMod then length
        const [firstHalf, first, secondHalf] = oneAndTwoHalves;
        expect(interpolateCrossSectionedItems(oneAndTwoHalves, first.day)).toEqual([
          createCrossSectionedItem([[firstHalf, secondHalf], [first]], first.startMod, secondHalf.endMod, first.day),
        ]);

        const flanked = flankWithClassItems(oneAndTwoHalves);
        const [firstFlank, , , , secondFlank] = flanked;
        expect(interpolateCrossSectionedItems(flanked, first.day)).toEqual([
          firstFlank,
          createCrossSectionedItem([[firstHalf, secondHalf], [first]], first.startMod, secondHalf.endMod, first.day),
          secondFlank,
        ]);
      });

      it('handles consecutive cross-sectioned blocks', () => {
        const [first, second, third, fourth, fifth, sixth] = consecutive;
        expect(interpolateCrossSectionedItems(consecutive, first.day)).toEqual([
          createCrossSectionedItem([[first], [second]], first.startMod, second.endMod, first.day),
          createCrossSectionedItem([[third], [fourth]], third.startMod, fourth.endMod, first.day),
          createCrossSectionedItem([[fifth], [sixth]], fifth.startMod, sixth.endMod, first.day),
        ]);

        const flanked = flankWithClassItems(consecutive);
        const [firstFlank, , , , , , , secondFlank] = flanked;
        expect(interpolateCrossSectionedItems(flanked, first.day)).toEqual([
          firstFlank,
          createCrossSectionedItem([[first], [second]], first.startMod, second.endMod, first.day),
          createCrossSectionedItem([[third], [fourth]], third.startMod, fourth.endMod, first.day),
          createCrossSectionedItem([[fifth], [sixth]], fifth.startMod, sixth.endMod, first.day),
          secondFlank,
        ]);
      });

      it('handles non-consecutive cross-sectioned blocks', () => {
        const [first, second, third, fourth] = nonConsecutive;
        expect(interpolateCrossSectionedItems(nonConsecutive, first.day)).toEqual([
          createCrossSectionedItem([[first], [second]], first.startMod, second.endMod, first.day),
          createCrossSectionedItem([[third], [fourth]], third.startMod, fourth.endMod, first.day),
        ]);

        // tslint:disable-next-line: trailing-comma
        const [firstB, secondB, between, thirdB, fourthB] = nonConsecutiveWithBetween;
        expect(interpolateCrossSectionedItems(nonConsecutiveWithBetween, firstB.day)).toEqual([
          createCrossSectionedItem([[firstB], [secondB]], firstB.startMod, secondB.endMod, firstB.day),
          between,
          createCrossSectionedItem([[thirdB], [fourthB]], thirdB.startMod, fourthB.endMod, firstB.day),
        ]);
      });

      it('handles partially overlapping mods', () => {
        const [first, second, third] = partialOverlap;
        expect(interpolateCrossSectionedItems(partialOverlap, first.day)).toEqual([
          createCrossSectionedItem([[first, third], [second]], first.startMod, third.endMod, first.day),
        ]);

        const flanked = flankWithClassItems(partialOverlap);
        const [firstFlank, , , , secondFlank] = flanked;
        expect(interpolateCrossSectionedItems(flanked, first.day)).toEqual([
          firstFlank,
          createCrossSectionedItem([[first, third], [second]], first.startMod, third.endMod, first.day),
          secondFlank,
        ]);
      });

      it('handles duplicate items for staff members', () => {
        const [firstCopy, , , , , annotation] = duplicates;
        expect(interpolateCrossSectionedItems(duplicates, firstCopy.day)).toEqual([
          createCrossSectionedItem([[firstCopy], [annotation]], firstCopy.startMod, annotation.endMod, firstCopy.day),
        ]);
      });
    });

    describe('interpolateOpenItems', () => {
      const schedules: Record<string, ScheduleItem[]> = openSchedules;
      const { full, between, beginning, end, both, withCrossSections } = schedules;

      it('ignores full schedule', () => {
        expect(interpolateOpenItems(full, 1)).toEqual(full);
      });

      it('inserts open mod in between classes', () => {
        const [first, second] = between;
        expect(interpolateOpenItems(between, 1)).toEqual([
          first,
          createOpenItem(6, 9, 1),
          second,
        ]);
      });

      it('handles open mod at day beginning', () => {
        expect(interpolateOpenItems(beginning, 1)).toEqual([
          createOpenItem(0, 8, 1),
          beginning[0],
        ]);
      });

      it('handles open mod at day end', () => {
        expect(interpolateOpenItems(end, 1)).toEqual([
          end[0],
          createOpenItem(7, 15, 1),
        ]);
      });

      it('handles both open mods at beginning and end', () => {
        const [first, second] = both;
        expect(interpolateOpenItems(both, 1)).toEqual([
          createOpenItem(0, 6, 1),
          first,
          second,
          createOpenItem(8, 15, 1),
        ]);
      });

      it('handles cross-section', () => {
        expect(interpolateOpenItems(withCrossSections, 1)).toEqual([
          createOpenItem(0, 3, 1),
          withCrossSections[0],
          createOpenItem(5, 15, 1),
        ]);
      });

      it('handles empty schedule for regular/wednesday', () => {
        const day = 1;
        expect(interpolateOpenItems([], day)).toEqual(createOpenDay(day));

        const wednesday = 3;
        expect(interpolateOpenItems([], wednesday)).toEqual(createOpenDay(wednesday));
      });
    });

    describe('interpolateAssembly', () => {
      const schedules: Record<string, ClassItem[]> = assemblySchedules;
      const { crossSectionWithCutsBefore, crossSectionWithCutsAfter, regular, longMod } = schedules;
      const createAssemblyItem = (day: number) => (
        createClassItem('Assembly', '', ModNumber.ASSEMBLY, ModNumber.FOUR, day, 'assembly')
      );

      it('ignores schedule if empty', () => {
        expect(interpolateAssembly([], 1)).toEqual([]);
      });

      it('handles cross-section that has a class that cuts thru assembly before', () => {
        const day = 1;
        const [second, first] = crossSectionWithCutsBefore;
        const [firstHalfOne] = splitClassItem(first, ModNumber.THREE);
        const [secondHalfOne, secondHalfTwo] = splitClassItem(second, ModNumber.THREE);
        const scheduleBefore = processSchedule(crossSectionWithCutsBefore as RawClassItem[]);
        const withAssemblyAfter = interpolateAssembly(scheduleBefore[day - 1], day);

        expect(withAssemblyAfter).toEqual([
          createOpenItem(ModNumber.HOMEROOM, first.startMod, day),
          createCrossSectionedItem([[firstHalfOne!], [secondHalfOne!]], first.startMod, ModNumber.THREE, day),
          createAssemblyItem(day),
          createCrossSectionedItem([[], [secondHalfTwo!]], ModNumber.THREE, second.endMod, day),
          createOpenItem(second.endMod, ModNumber.FIFTEEN, day),
        ]);
      });

      it('handles cross-section that has a class that cuts thru assembly after', () => {
        const day = 1;
        const [second, first] = crossSectionWithCutsAfter;
        const [, firstHalfTwo] = splitClassItem(first, ModNumber.THREE);
        const [secondHalfOne, secondHalfTwo] = splitClassItem(second, ModNumber.THREE);
        const scheduleAfter = processSchedule(crossSectionWithCutsAfter as RawClassItem[]);
        const withAssemblyBefore = interpolateAssembly(scheduleAfter[day - 1], day);

        expect(withAssemblyBefore).toEqual([
          createOpenItem(ModNumber.HOMEROOM, second.startMod, day),
          createCrossSectionedItem([[secondHalfOne!], []], second.startMod, ModNumber.THREE, day),
          createAssemblyItem(day),
          createCrossSectionedItem([[secondHalfTwo!], [firstHalfTwo!]], ModNumber.THREE, first.endMod, day),
          createOpenItem(first.endMod, ModNumber.FIFTEEN, day),
        ]);
      });

      it('handles cross-section without extra cuts', () => {
        const day = 1;
        const [first, second] = regular;
        const schedule = processSchedule(regular as RawClassItem[]);
        const withAssembly = interpolateAssembly(schedule[day - 1], day);

        expect(withAssembly).toEqual([
          createOpenItem(ModNumber.HOMEROOM, first.startMod, day),
          first,
          createAssemblyItem(day),
          second,
          createOpenItem(second.endMod, ModNumber.FIFTEEN, day),
        ]);
      });

      it('handles long non-cross-sectioned mod during assembly', () => {
        const day = 1;
        const [first, second] = splitClassItem(longMod[0], ModNumber.THREE);
        const schedule = processSchedule(longMod as RawClassItem[]);
        const withAssembly = interpolateAssembly(schedule[day - 1], day);

        expect(withAssembly).toEqual([
          createOpenItem(ModNumber.HOMEROOM, first!.startMod, day),
          first,
          createAssemblyItem(day),
          second,
          createOpenItem(second!.endMod, ModNumber.FIFTEEN, day),
        ]);
      });
    });
  });

  describe('getFinalsSchedule', () => {
    it('uses fallback homeroom', () => {
      const day = 4;
      const finals = getFinalsSchedule([], day);
      const fallback = createClassItem('Homeroom', '', ModNumber.HOMEROOM, ModNumber.FINALS_ONE, day, 'homeroom');
      const expected = Array(4).fill(undefined).map((_, i) => {
        const startMod = ModNumber.FINALS_ONE + i;
        return createClassItem(getModNameFromModNumber(startMod), '', startMod, startMod + 1, fallback.day, 'finals');
      });

      expect(finals).toEqual([fallback, ...expected]);
    });

    it('returns final schedule with homeroom', () => {
      const day = 5;
      const homeroom = createClassItem('Homeroom', 'Rm 111', ModNumber.HOMEROOM, ModNumber.FINALS_ONE, day, 'homeroom');
      const finals = getFinalsSchedule([homeroom], day);
      const expected = Array(4).fill(undefined).map((_, i) => {
        const startMod = ModNumber.FINALS_ONE + i;
        return createClassItem(getModNameFromModNumber(startMod), '', startMod, startMod + 1, homeroom.day, 'finals');
      });

      expect(finals).toEqual([homeroom, ...expected]);
    });
  });

  describe('convertToClassItem', () => {
    it('should convert a raw item to a class item', () => {
      const [rawItem]: RawSchedule = rawSchedules.groupByDay;
      expect(convertToClassItem(rawItem)).toEqual({
        sourceId: 50015000,
        sourceType: 'course',
        title: 'Test',
        body: '',
        day: 5,
        startMod: 0,
        length: 15,
        endMod: 15,
      });
    });
  });

  describe('processSchedule', () => {
    const schedules: Record<string, RawSchedule> = rawSchedules;
    const { groupByDay, sortByModThenLength } = schedules;

    it('converts raw schedule into 5-length array of day schedules', () => {
      expect(processSchedule([])).toHaveLength(5);
    });

    it('returns empty schedule for empty raw class item array', () => {
      expect(processSchedule([])).toEqual([[], [], [], [], []]);
    });

    it('groups schedule items into separate arrays by day', () => {
      const [five, one, three] = groupByDay.map(convertToClassItem);
      expect(processSchedule(groupByDay)).toEqual([
        [one], createOpenDay(2), [three], createOpenDay(4), [five],
      ]);
    });

    it('sorts each day schedule by startMod then length', () => {
      const [first, third, second] = sortByModThenLength.map(convertToClassItem);
      expect(processSchedule(sortByModThenLength)).toEqual([
        [
          first,
          createCrossSectionedItem([[second], [third]], second.startMod, third.endMod, first.day),
          createOpenItem(third.endMod, 15, first.day),
        ],
        createOpenDay(2), createOpenDay(3), createOpenDay(4), createOpenDay(5),
      ]);
    });
  });
});
