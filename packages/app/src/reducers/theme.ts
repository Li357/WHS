import { ThemeAction, ThemeState, ThemeActions, Theme } from '../types/store';
import { lightTheme, darkTheme } from '../constants/theme';

export default function themeReducer(state: ThemeState = lightTheme, action: ThemeAction) {
  switch (action.type) {
    case ThemeActions.SET_THEME:
      return action.payload === Theme.LIGHT ? lightTheme : darkTheme;
    default:
      return state;
  }
}
