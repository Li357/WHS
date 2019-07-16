import { DayState, DayAction, DayActions } from '../types/store';
import { initialDayState } from '../constants/store';

export default function dayReducer(state: DayState = initialDayState, action: DayAction) {
  switch (action.type) {
    case DayActions.UPDATE_DAY_STATE:
      return { ...state, lastStateUpdate: action.payload };
    case DayActions.SET_DAY_SCHEDULE:
      return { ...state, schedule: action.payload };
    default:
      return state;
  }
}
