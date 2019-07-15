import { combineReducers } from 'redux';

import userReducer from './user';
import dayReducer from './day';
import themeReducer from './theme';
import datesReducer from './dates';
import { AppAction, AppState, MiscellaneousActions } from '../types/store';

const combinedReducer = combineReducers({
  user: userReducer,
  day: dayReducer,
  theme: themeReducer,
  dates: datesReducer,
});

export default function rootReducer(state: AppState | undefined, action: AppAction): AppState {
  const intermediateState = combinedReducer(state, action);
  switch (action.type) {
    case MiscellaneousActions.LOG_OUT:
      return combinedReducer(undefined, { type: MiscellaneousActions.OTHER });
    default:
      return intermediateState;
  }
}
