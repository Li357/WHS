import { DayState, UserState, DatesState } from '../types/store';

export const MAX_TEACHER_SCHEDULES = 50;

export const initialDayState: DayState = {
  schedule: [],
  lastStateUpdate: null,
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
