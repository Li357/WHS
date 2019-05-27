import { Platform } from 'react-native';

import { ThemeAction, ThemeState, FontThemeKeys, ThemeActions, Theme } from '../types/store';

const fonts: Pick<ThemeState, FontThemeKeys> = Platform.select({
  ios: {
    titleFont: 'SF-Bold',
    subtitleFont: 'SF-Light',
  },
  android: {
    titleFont: 'Roboto-Bold',
    subtitleFont: 'Roboto-Light',
  },
});

export const lightTheme: ThemeState = {
  backgroundColor: '#FFFFFF',
  foregroundColor: '#FFFFFF',
  textColor: '#000000',
  subtextColor: '#7C7C7C',
  borderColor: '#C6C6C6',
  accentColor: '#EF4040',
  ...fonts,
};

export const darkTheme: ThemeState = {
  backgroundColor: '#25262A',
  foregroundColor: '#4A4A4A',
  textColor: '#FFFFFF',
  subtextColor: '#FFFFFF',
  borderColor: '#FFFFFF',
  accentColor: '#EF4040',
  ...fonts,
};

export default function themeReducer(state: ThemeState = lightTheme, action: ThemeAction) {
  switch (action.type) {
    case ThemeActions.SET_THEME:
      return action.payload === Theme.LIGHT ? lightTheme : darkTheme;
    default:
      return state;
  }
}
