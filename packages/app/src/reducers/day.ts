import { DayState, DayAction, DayActions } from '../types/store';
import { initialDayState } from '../constants/store';

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
