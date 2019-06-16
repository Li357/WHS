import { ThemeState } from '../types/store';

export const lightTheme: ThemeState = {
  backgroundColor: '#FFFFFF',
  foregroundColor: '#FFFFFF',
  textColor: '#000000',
  subtextColor: '#7C7C7C',
  borderColor: '#C6C6C6',
  accentColor: '#EF4040',
  statusBar: 'dark-content',
};

export const darkTheme: ThemeState = {
  backgroundColor: '#25262A',
  foregroundColor: '#4A4A4A',
  textColor: '#FFFFFF',
  subtextColor: '#FFFFFF',
  borderColor: '#FFFFFF',
  accentColor: '#EF4040',
  statusBar: 'light-content',
};
