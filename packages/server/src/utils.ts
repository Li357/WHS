import {
  DateTypeNames,
  NameGroup,
  ELearningSettingsSchema,
} from '../shared/types/api';

export function getCookie(name: string) {
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  if (match) {
    return match[2] !== undefined ? match[2] : null;
  }
  return null;
}

export function range(start: number, end: number) {
  return Array(end - start)
    .fill(undefined)
    .map((_, i) => i + start);
}

export const dateTypeNames: DateTypeNames = {
  'assembly': 'Assembly Dates',
  'no-school': 'No School Dates',
  'early-dismissal': 'Early Dismissal Dates',
  'late-start': 'Late Start Dates',
  'semester-one-start': 'Semester One Start',
  'semester-one-end': 'Semester One End',
  'semester-two-start': 'Semester Two Start',
  'semester-two-end': 'Semester Two End',
  'elearning': 'E-Learning Settings',
};

export const ELEARNING_CODE_TYPES = ['yellow', 'red'];
export const ELEARNING_NAME_GROUPS = [
  ['A', 'E'],
  ['F', 'K'],
  ['L', 'R'],
  ['S', 'Z'],
];
export const ELEARNING_DAYS = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
];
export const ELEARNING_INITIAL_SETTINGS: ELearningSettingsSchema[] = [
  {
    type: 'yellow',
    groups: {
      monday: [],
      tuesday: [],
      wednesday: [],
      thursday: [],
      friday: [],
    },
    dates: [],
  },
  {
    type: 'red',
    groups: {
      monday: [],
      tuesday: [],
      wednesday: [],
      thursday: [],
      friday: [],
    },
    dates: [],
  },
];
