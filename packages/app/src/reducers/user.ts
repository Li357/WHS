import { UserAction, UserActions, UserState } from '../types/store';

export const initialUserState: UserState = {
  username: '',
  password: '',
  name: '',
  schedule: [],
  schoolPicture: '',
  profilePhoto: '',
  isTeacher: false,
  addedSchedules: [],
  classOf: '',
  homeroom: '',
  counselor: '',
  dean: '',
  id: '',
};

export default function userReducer(state: UserState = initialUserState, action: UserAction): UserState {
  switch (action.type) {
    case UserActions.SET_USER_INFO:
      return { ...state, ...action.payload };
    case UserActions.SET_USER_SCHEDULE:
      return { ...state, schedule: action.payload };
    case UserActions.ADD_SCHEDULE:
      return {
        ...state,
        addedSchedules: [...state.addedSchedules, action.payload],
      };
    default:
      return state;
  }
}
