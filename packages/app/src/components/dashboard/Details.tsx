import React from 'react';
import styled from 'styled-components/native';

import { UserInfo } from '../../types/store';
import Detail from './Detail';

const DetailsContainer = styled.View`
  align-items: stretch;
  width: 100%;
`;

interface DetailProps {
  info: UserInfo;
  onPress: () => void;
}

export default function Details({ info, onPress }: DetailProps) {
  const { dean, counselor, homeroom, id } = info;
  return (
    <DetailsContainer>
      <Detail name="Dean" value={dean!} />
      <Detail name="Counselor" value={counselor!} />
      <Detail name="Homeroom" value={homeroom!} />
      <Detail name="ID" value={id!} />
    </DetailsContainer>
  );
}
