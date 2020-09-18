import { CustomDatesActions, CustomDatesAction, CustomDatesState } from '../types/store';
import { initialCustomDatesState } from '../constants/store';

export default function customDatesReducer(
  state: CustomDatesState = initialCustomDatesState,
  action: CustomDatesAction,
) {
  switch (action.type) {
    case CustomDatesActions.SET_DATES:
      return { ...state, ...action.payload };
    default:
      return state;
  }
}
