import { ModNumber, DaySchedule } from '../types/schedule';

export const REGULAR: DaySchedule = [
  ['8:00', '8:15', ModNumber.HOMEROOM],
  ['8:20', '9:00', ModNumber.ONE],
  ['9:05', '9:40', ModNumber.TWO],
  ['9:45', '10:20', ModNumber.THREE],
  ['10:25', '10:40', ModNumber.FOUR],
  ['10:45', '11:00', ModNumber.FIVE],
  ['11:05', '11:22', ModNumber.SIX],
  ['11:27', '11:44', ModNumber.SEVEN],
  ['11:49', '12:06', ModNumber.EIGHT],
  ['12:11', '12:28', ModNumber.NINE],
  ['12:33', '12:50', ModNumber.TEN],
  ['12:55', '13:10', ModNumber.ELEVEN],
  ['13:15', '13:50', ModNumber.TWELVE],
  ['13:55', '14:30', ModNumber.THIRTEEN],
  ['14:35', '15:10', ModNumber.FOURTEEN],
];

export const WEDNESDAY: DaySchedule = [
  ['8:00', '8:40', ModNumber.ONE],
  ['8:45', '9:20', ModNumber.TWO],
  ['9:25', '10:00', ModNumber.THREE],
  ['10:05', '10:20', ModNumber.FOUR],
  ['10:25', '10:40', ModNumber.FIVE],
  ['10:45', '11:02', ModNumber.SIX],
  ['11:07', '11:24', ModNumber.SEVEN],
  ['11:29', '11:46', ModNumber.EIGHT],
  ['11:51', '12:08', ModNumber.NINE],
  ['12:13', '12:30', ModNumber.TEN],
  ['12:35', '12:50', ModNumber.ELEVEN],
  ['12:55', '13:30', ModNumber.TWELVE],
  ['13:35', '14:10', ModNumber.THIRTEEN],
  ['14:15', '14:50', ModNumber.FOURTEEN],
];

export const EARLY_DISMISSAL: DaySchedule = [
  ['8:00', '8:05', ModNumber.HOMEROOM],
  ['8:10', '8:40', ModNumber.ONE],
  ['8:45', '9:10', ModNumber.TWO],
  ['9:15', '9:40', ModNumber.THREE],
  ['9:45', '9:55', ModNumber.FOUR],
  ['10:00', '10:10', ModNumber.FIVE],
  ['10:15', '10:25', ModNumber.SIX],
  ['10:30', '10:40', ModNumber.SEVEN],
  ['10:45', '10:55', ModNumber.EIGHT],
  ['11:00', '11:10', ModNumber.NINE],
  ['11:15', '11:25', ModNumber.TEN],
  ['11:30', '11:40', ModNumber.ELEVEN],
  ['11:45', '12:10', ModNumber.TWELVE],
  ['12:15', '12:40', ModNumber.THIRTEEN],
  ['12:45', '13:10', ModNumber.FOURTEEN],
];

export const TWELVE_EARLY_DISMISSAL: DaySchedule = [
  ['8:00', '8:20', ModNumber.HOMEROOM],
  ['8:25', '8:45', ModNumber.ONE],
  ['8:50', '9:10', ModNumber.TWO],
  ['9:15', '9:35', ModNumber.THREE],
  ['9:40', '9:50', ModNumber.FOUR],
  ['9:55', '10:05', ModNumber.FIVE],
  ['10:10', '10:20', ModNumber.SIX],
  ['10:25', '10:35', ModNumber.SEVEN],
  ['10:40', '10:50', ModNumber.EIGHT],
  ['10:55', '11:05', ModNumber.NINE],
  ['11:10', '11:20', ModNumber.TEN],
  ['11:25', '11:35', ModNumber.ELEVEN],
  ['11:40', '12:00', ModNumber.TWELVE],
  ['12:05', '12:25', ModNumber.THIRTEEN],
  ['12:30', '12:50', ModNumber.FOURTEEN],
];

export const LATE_START: DaySchedule = [
  ['10:00', '10:05', ModNumber.HOMEROOM],
  ['10:10', '10:40', ModNumber.ONE],
  ['10:45', '11:10', ModNumber.TWO],
  ['11:15', '11:40', ModNumber.THREE],
  ['11:45', '11:55', ModNumber.FOUR],
  ['12:00', '12:10', ModNumber.FIVE],
  ['12:15', '12:25', ModNumber.SIX],
  ['12:30', '12:40', ModNumber.SEVEN],
  ['12:45', '12:55', ModNumber.EIGHT],
  ['13:00', '13:10', ModNumber.NINE],
  ['13:15', '13:25', ModNumber.TEN],
  ['13:30', '13:40', ModNumber.ELEVEN],
  ['13:45', '14:10', ModNumber.TWELVE],
  ['14:15', '14:40', ModNumber.THIRTEEN],
  ['14:45', '15:10', ModNumber.FOURTEEN],
];

export const LATE_START_WEDNESDAY: DaySchedule = [
  ['10:00', '10:25', ModNumber.ONE],
  ['10:30', '10:55', ModNumber.TWO],
  ['11:00', '11:25', ModNumber.THREE],
  ['11:30', '11:40', ModNumber.FOUR],
  ['11:45', '11:55', ModNumber.FIVE],
  ['12:00', '12:10', ModNumber.SIX],
  ['12:15', '12:25', ModNumber.SEVEN],
  ['12:30', '12:40', ModNumber.EIGHT],
  ['12:45', '12:55', ModNumber.NINE],
  ['13:00', '13:10', ModNumber.TEN],
  ['13:15', '13:25', ModNumber.ELEVEN],
  ['13:30', '13:55', ModNumber.TWELVE],
  ['14:00', '14:25', ModNumber.THIRTEEN],
  ['14:30', '14:50', ModNumber.FOURTEEN],
];

export const ASSEMBLY: DaySchedule = [
  ['8:00', '8:15', ModNumber.HOMEROOM],
  ['8:20', '8:50', ModNumber.ONE],
  ['8:55', '9:25', ModNumber.TWO],
  ['9:30', '10:10', ModNumber.ASSEMBLY],
  ['10:15', '10:45', ModNumber.THREE],
  ['10:50', '11:05', ModNumber.FOUR],
  ['11:10', '11:25', ModNumber.FIVE],
  ['11:30', '11:45', ModNumber.SIX],
  ['11:50', '12:05', ModNumber.SEVEN],
  ['12:10', '12:25', ModNumber.EIGHT],
  ['12:30', '12:45', ModNumber.NINE],
  ['12:50', '13:05', ModNumber.TEN],
  ['13:10', '13:25', ModNumber.ELEVEN],
  ['13:30', '14:00', ModNumber.TWELVE],
  ['14:05', '14:35', ModNumber.THIRTEEN],
  ['14:40', '15:10', ModNumber.FOURTEEN],
];

export const FINALS: DaySchedule = [
  ['8:00', '8:05', ModNumber.HOMEROOM],
  ['8:10', '9:10', ModNumber.FINALS_ONE],
  ['9:15', '10:15', ModNumber.FINALS_TWO],
  ['10:20', '11:20', ModNumber.FINALS_THREE],
  ['11:25', '12:25', ModNumber.FINALS_FOUR],
];

// These are really only for symbolic use, and separate references allow for === checks
export const BREAK: DaySchedule = [];
export const SUMMER: DaySchedule = [];
export const WEEKEND: DaySchedule = [];
