import { DayState, UserState, DatesState } from '../types/store';

export const MAX_TEACHER_SCHEDULES = 50;

// We store the day schedule as a string because we need it to index the SCHEDULES import and maintain
// references across multiple app sessions, and we it results in fewer items stored in the Redux store
export const initialDayState: DayState = {
  schedule: 'REGULAR',
};

export const initialUserState: UserState = {
  username: '',
  password: '',
  name: '',
  classOf: '',
  schedule: [],
  schoolPicture: '',
  profilePhoto: '',
  isTeacher: false,
  teacherSchedules: [],
};

export const initialDatesState: DatesState = {
  assembly: [],
  noSchool: [],
  earlyDismissal: [],
  lateStart: [],
  semesterOneStart: null,
  semesterOneEnd: null,
  semesterTwoStart: null,
  semesterTwoEnd: null,
};
