import { ThemeState } from '../types/store';
import { ACCENT_COLOR } from './style';

export const lightTheme: ThemeState = {
  backgroundColor: '#FFFFFF',
  foregroundColor: '#F4F6F8',
  textColor: '#000000',
  subtextColor: '#7C7C7C',
  borderColor: '#C6C6C6',
  accentColor: ACCENT_COLOR,
  statusBar: 'dark-content',
};

export const darkTheme: ThemeState = {
  backgroundColor: '#25262A',
  foregroundColor: '#4A4A4A',
  textColor: '#FFFFFF',
  subtextColor: '#A5A5A5',
  borderColor: '#A0A0A0',
  accentColor: ACCENT_COLOR,
  statusBar: 'light-content',
};
