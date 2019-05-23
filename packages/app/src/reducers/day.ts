import { DayState, DayAction, DayActions } from '../types/store';

const initialState: DayState = {
  daySchedule: [],
  isBreak: false,
  isFinals: false,
  hasAssembly: false,
  lastStateUpdate: new Date(),
};

export default function dayReducer(state: DayState = initialState, action: DayAction): DayState {
  switch (action.type) {
    case DayActions.SET_DAY_INFO:
      return { ...state, ...action.payload };
    case DayActions.SET_DAY_SCHEDULE:
      return { ...state, daySchedule: action.payload };
    default:
      return state;
  }
}
