import { UserAction, UserActions, UserState } from '../types/store';
import { initialUserState } from '../constants/store';

export default function userReducer(state: UserState = initialUserState, action: UserAction) {
  switch (action.type) {
    case UserActions.SET_USER_CREDENTIALS:
    case UserActions.SET_USER_INFO:
      return { ...state, ...action.payload };
    case UserActions.SET_USER_SCHEDULE:
      return { ...state, schedule: action.payload };
    case UserActions.SET_TEACHER_SCHEDULES:
      return { ...state, teacherSchedules: action.payload };
    case UserActions.ADD_TEACHER_SCHEDULE:
      return {
        ...state,
        teacherSchedules: [...state.teacherSchedules, action.payload],
      };
    default:
      return state;
  }
}
