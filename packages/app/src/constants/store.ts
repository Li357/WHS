import { DayState, UserState } from '../types/store';

export const MAX_TEACHER_SCHEDULES = 50;

export const initialDayState: DayState = {
  daySchedule: [],
  isBreak: false,
  isFinals: false,
  hasAssembly: false,
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
