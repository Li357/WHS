import React, { ReactNodeArray, ReactNode } from 'react';
import styled from 'styled-components/native';

import {
  CARD_PADDING, CARD_BORDER_RADIUS, CARD_PADDING_TOP, CARD_MARGIN_BOTTOM, CARD_BORDER_WIDTH,
} from '../../constants/style';

const CardContainer = styled.View<{ warning: boolean }>`
  margin-bottom: ${CARD_MARGIN_BOTTOM};
  padding: ${CARD_PADDING_TOP} ${CARD_PADDING} ${CARD_PADDING};
  align-items: stretch;
  background-color: ${({ theme }) => theme.foregroundColor};
  border: ${CARD_BORDER_WIDTH} solid ${({ theme, warning }) => warning ? theme.accentColor : theme.backgroundColor};
  border-radius: ${CARD_BORDER_RADIUS};
`;

interface CardProps {
  children: ReactNode | ReactNodeArray;
  warning?: boolean;
}

export default function Card({ children, warning = false }: CardProps) {
  return (
    <CardContainer warning={warning}>
      {children}
    </CardContainer>
  );
}
