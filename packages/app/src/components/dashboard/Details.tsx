import React from 'react';
import { View } from 'react-native';
import styled from 'styled-components/native';

import { UserInfo } from '../../types/store';
import Detail from './Detail';
import BadgeButton from './BadgeButton';
import { PROFILE_PHOTO_SIZE } from '../../constants/style';

const DetailsContainer = styled.View`
  justify-content: space-between;
  align-items: stretch;
  width: 100%;
  height: ${PROFILE_PHOTO_SIZE};
`;

interface DetailProps {
  info: UserInfo;
  onPress: () => void;
}

export default function Details({ info, onPress }: DetailProps) {
  const { dean, counselor, homeroom, id } = info;
  // TODO: Handle when details are larger than sanctioned height
  return (
    <DetailsContainer>
      <View>
        <Detail name="Dean" value={dean!} />
        <Detail name="Counselor" value={counselor!} />
        <Detail name="Homeroom" value={homeroom!} />
        <Detail name="Student ID" value={id!} />
      </View>
      <BadgeButton onPress={onPress}>BACK</BadgeButton>
    </DetailsContainer>
  );
}
