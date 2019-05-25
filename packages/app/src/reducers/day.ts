import { DayState, DayAction, DayActions } from '../types/store';

export const initialDayState: DayState = {
  daySchedule: [],
  isBreak: false,
  isFinals: false,
  hasAssembly: false,
  lastStateUpdate: null,
};

export default function dayReducer(state: DayState = initialDayState, action: DayAction) {
  switch (action.type) {
    case DayActions.SET_DAY_INFO:
      return { ...state, ...action.payload };
    case DayActions.SET_DAY_SCHEDULE:
      return { ...state, daySchedule: action.payload };
    default:
      return state;
  }
}
