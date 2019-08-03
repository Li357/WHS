import { DayState, DayAction, DayActions } from '../types/store';
import { initialDayState } from '../constants/store';

export default function dayReducer(state: DayState = initialDayState, action: DayAction) {
  switch (action.type) {
    case DayActions.SET_DAY_SCHEDULE:
      return { ...state, schedule: action.payload };
    case DayActions.SET_REFRESHED:
      const [refreshedSemesterOne, refreshedSemesterTwo] = action.payload;
      return { ...state, refreshedSemesterOne, refreshedSemesterTwo };
    default:
      return state;
  }
}
