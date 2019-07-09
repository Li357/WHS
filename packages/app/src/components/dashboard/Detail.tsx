import React from 'react';
import styled from 'styled-components/native';

import Subtext from '../common/Subtext';
import { TEXT_FONT } from '../../constants/style';

const DetailText = styled(Subtext)`
  color: ${({ theme }) => theme.textColor};
`;

const BoldText = styled(DetailText)`
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
  // Differing font sizes for certain details does not look good
  return (
    <DetailContainer>
      <BoldText adjustsFontSizeToFit={false}>{`${name} `}</BoldText>
      <DetailText adjustsFontSizeToFit={false}>{value}</DetailText>
    </DetailContainer>
  );
}
