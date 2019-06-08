import { DayState, UserState } from '../types/store';

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
  schedule: [],
  schoolPicture: '',
  profilePhoto: '',
  isTeacher: false,
  teacherSchedules: [],
};
