import { DatesState, DatesAction, DatesActions } from '../types/store';
import { initialDatesState } from '../constants/store';

export default function datesReducer(state: DatesState = initialDatesState, action: DatesAction) {
  switch (action.type) {
    case DatesActions.SET_DATES:
      return { ...state, ...action.payload };
    default:
      return state;
  }
}
