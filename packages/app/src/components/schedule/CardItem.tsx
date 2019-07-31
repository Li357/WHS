import React, { ReactNode } from 'react';
import styled from 'styled-components/native';

import { BORDER_WIDTH, SCHEDULE_CARD_ITEM_HEIGHT, SCHEDULE_CARD_BODYTEXT_SIZE } from '../../constants/style';
import { ScheduleItem, ModNumber } from '../../types/schedule';
import { getOccupiedMods, getShortNameFromModNumber, isHalfMod } from '../../utils/query-schedule';
import Subtext from '../common/Subtext';

const ItemContainer = styled.View<{ first: boolean, type: string }>`
  flex-direction: row;
  align-items: stretch;
  border-top-width: ${({ first }) => first ? 0 : BORDER_WIDTH};
  border-top-color: ${({ theme }) => theme.borderColor};
  background-color: ${({ theme, type }) => (
    type === 'open' || type === 'annotation'
      ? theme.foregroundColor
      : theme.backgroundColor
  )}
`;

const IndicatorsContainer = styled.View`
  border-right-width: ${BORDER_WIDTH};
  border-right-color: ${({ theme }) => theme.borderColor};
  align-items: stretch;
  flex: 2;
`;

const IndicatorContainer = styled.View`
  justify-content: center;
  align-items: center;
`;

export const Title = styled(Subtext)`
  text-align: center;
  font-size: ${SCHEDULE_CARD_BODYTEXT_SIZE};
  color: ${({ theme }) => theme.textColor};
`;

export const BodyText = styled(Subtext)`
  text-align: center;
  font-size: ${SCHEDULE_CARD_BODYTEXT_SIZE};
`;

interface CardItemProps {
  scheduleItem: ScheduleItem;
  type: string;
  first: boolean;
  isFinals?: boolean;
  children: ReactNode;
}

export default function CardItem({ children, type, first, scheduleItem, isFinals = false }: CardItemProps) {
  const classMods = getOccupiedMods(scheduleItem);
  const modHeights = classMods.map((mod) => {
    const isHalf = (!isFinals && isHalfMod(mod)) || mod === ModNumber.HOMEROOM;
    return SCHEDULE_CARD_ITEM_HEIGHT / (isHalf ? 2 : 1);
  });

  const modIndicators = classMods.map((mod, index) => {
    const indicator = getShortNameFromModNumber(mod);
    return (
      <IndicatorContainer key={indicator} style={{ height: modHeights[index] }}>
        <Title>{indicator}</Title>
      </IndicatorContainer>
    );
  });

  return (
    <ItemContainer first={first} type={type}>
      <IndicatorsContainer>{modIndicators}</IndicatorsContainer>
      {children}
    </ItemContainer>
  );
}
