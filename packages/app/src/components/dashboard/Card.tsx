import React, { ReactNodeArray, ReactNode } from 'react';
import styled from 'styled-components/native';

import { CARD_PADDING, CARD_BORDER_RADIUS, CARD_PADDING_TOP, CARD_MARGIN_BOTTOM } from '../../constants/style';
import Subtext from '../common/Subtext';

const CardContainer = styled.View`
  margin-bottom: ${CARD_MARGIN_BOTTOM};
  padding: ${CARD_PADDING_TOP} ${CARD_PADDING} ${CARD_PADDING};
  align-items: stretch;
  border: 1px solid ${({ theme }) => theme.borderColor};
  border-radius: ${CARD_BORDER_RADIUS};
`;

interface CardProps {
  title: string;
  children: ReactNode | ReactNodeArray;
}

export default function Card({ title, children }: CardProps) {
  return (
    <CardContainer>
      {children}
      <Subtext>{title}</Subtext>
    </CardContainer>
  );
}
