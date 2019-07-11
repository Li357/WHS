import { ThemeState } from '../types/store';

export const lightTheme: ThemeState = {
  backgroundColor: '#FFFFFF',
  foregroundColor: '#F7F9FC',
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
  subtextColor: '#A5A5A5',
  borderColor: '#A0A0A0',
  accentColor: '#EF4040',
  statusBar: 'light-content',
};
