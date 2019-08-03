import React, { ReactNodeArray, ReactNode } from 'react';
import styled from 'styled-components/native';

import {
  CARD_PADDING, CARD_BORDER_RADIUS, CARD_PADDING_TOP, CARD_MARGIN_BOTTOM, CARD_BORDER_WIDTH,
} from '../../constants/style';

const CardContainer = styled.View`
  margin-bottom: ${CARD_MARGIN_BOTTOM};
  padding: ${CARD_PADDING_TOP} ${CARD_PADDING} ${CARD_PADDING};
  align-items: stretch;
  background-color: ${({ theme }) => theme.foregroundColor};
  border-radius: ${CARD_BORDER_RADIUS};
`;

interface CardProps {
  children: ReactNode | ReactNodeArray;
}

export default function Card({ children }: CardProps) {
  return (<CardContainer>{children}</CardContainer>);
}
