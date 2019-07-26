import React, { ReactNode } from 'react';
import { StatusBar } from 'react-native';
import { useSelector } from 'react-redux';
import { ThemeProvider } from 'styled-components/native';

import { AppState } from '../../types/store';

interface ThemerProps {
  children: ReactNode;
}

export default function Themer({ children }: ThemerProps) {
  const theme = useSelector((state: AppState) => state.theme);
  return (
    <ThemeProvider theme={theme}>
      <>
        <StatusBar barStyle={theme.statusBar} />
        {children}
      </>
    </ThemeProvider>
  );
}
