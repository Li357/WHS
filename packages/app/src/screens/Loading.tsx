import React from 'react';
import { StatusBar } from 'react-native';
import styled from 'styled-components/native';
import { CircleSnail } from 'react-native-progress';

import Screen from '../components/common/Screen';
import { ACCENT_COLOR } from '../constants/style';

const LoadingScreen = styled(Screen)`
  align-items: center;
  justify-content: center;
  background-color: #ffffff;
`;

export default function Loading() {
  return (
    <LoadingScreen>
      <StatusBar barStyle="dark-content" />
      <CircleSnail color={ACCENT_COLOR} />
    </LoadingScreen>
  );
}
