import React from 'react';
import styled from 'styled-components/native';

import Subtext from '../common/Subtext';
import { TEXT_FONT } from '../../constants/style';

const BoldText = styled(Subtext)`
  font-family: ${TEXT_FONT};
`;

const DetailContainer = styled.View`
  flex-direction: row;
`;

interface DetailProps {
  name: string;
  value: string;
}

export default function Detail({ name, value }: DetailProps) {
  return (
    <DetailContainer>
      <BoldText>{`${name} `}</BoldText>
      <Subtext>{value}</Subtext>
    </DetailContainer>
  );
}
