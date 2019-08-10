import React from 'react';
import { View } from 'react-native';
import styled from 'styled-components/native';

import { UserInfo } from '../../types/store';
import Detail from './Detail';
import { PROFILE_MARGIN_BOTTOM } from '../../constants/style';

const DetailsContainer = styled.View`
  flex: 1;
  justify-content;
  align-items: center;
  width: 100%;
  margin-bottom: ${PROFILE_MARGIN_BOTTOM};
`;

interface DetailProps {
  userInfo: UserInfo;
}

export default function Details({ userInfo }: DetailProps) {
  const { dean, counselor, homeroom, id } = userInfo;
  return (
    <DetailsContainer>
      <View>
        <Detail name="Dean" value={dean!} />
        <Detail name="Counselor" value={counselor!} />
        <Detail name="Homeroom" value={homeroom!} />
        <Detail name="Student ID" value={id!} />
      </View>
    </DetailsContainer>
  );
}
