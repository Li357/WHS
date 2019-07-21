import React from 'react';
import styled from 'styled-components/native';

import { ClassItem, ModNumber } from '../../types/schedule';
import {
  SCHEDULE_CARD_ITEM_HEIGHT, SCHEDULE_CARD_BODYTEXT_SIZE,
  BORDER_WIDTH, SUBTEXT_SIZE,
} from '../../constants/style';
import { getOccupiedMods, getShortNameFromModNumber, isHalfMod } from '../../utils/query-schedule';
import Text from '../common/Text';
import Subtext from '../common/Subtext';

const ItemContainer = styled.View<{ type: string }>`
  flex-direction: row;
  align-items: stretch;
  border-top-width: ${BORDER_WIDTH};
  border-top-color: ${({ theme }) => theme.borderColor};
  background-color: ${({ theme, type }) => (
    type === 'open' || type === 'annotation'
      ? theme.foregroundColor
      : theme.backgroundColor
  )}
`;

const DetailsContainer = styled.View`
  justify-content: center;
  align-items: center;
  flex: 8;
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

const Title = styled(Subtext)`
  color: ${({ theme }) => theme.textColor};
`;

const BodyText = styled(Subtext)`
  font-size: ${SCHEDULE_CARD_BODYTEXT_SIZE};
`;

interface ScheduleCardItemProps {
  scheduleItem: ClassItem;
  isFinals: boolean;
}

export default function ScheduleCardItem({ scheduleItem, isFinals }: ScheduleCardItemProps) {
  const { title, body, sourceType } = scheduleItem;
  const classMods = getOccupiedMods(scheduleItem);
  const modHeights = classMods.map((mod) => {
    const isHalf = !isFinals && isHalfMod(mod) || mod === ModNumber.HOMEROOM;
    return SCHEDULE_CARD_ITEM_HEIGHT / (isHalf ? 2 : 1);
  });
  const totalHeight = modHeights.reduce((a, b) => a + b, 0);

  const modIndicators = classMods.map((mod, index) => {
    const indicator = getShortNameFromModNumber(mod);
    return (
      <IndicatorContainer key={indicator} style={{ height: modHeights[index] }}>
        <Title>{indicator}</Title>
      </IndicatorContainer>
    );
  });

  return (
    <ItemContainer type={sourceType} style={{ height: totalHeight }}>
      <IndicatorsContainer>{modIndicators}</IndicatorsContainer>
      <DetailsContainer>
        <Title>{title}</Title>
        {body.length > 0 && <BodyText>{body}</BodyText>}
      </DetailsContainer>
    </ItemContainer>
  );
}
