import React from 'react';
import { Text } from 'react-native';
import styled from 'styled-components/native';

import Screen from '../components/common/Screen';

const LoadingScreen = styled(Screen)`
  align-items: center;
  justify-content: center;
  background-color: #ffffff;
`;

export default function Loading() {
  return (
    <LoadingScreen>
      <Text>Loading...</Text>
    </LoadingScreen>
  );
}
