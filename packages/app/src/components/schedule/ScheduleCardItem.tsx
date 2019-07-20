import React from 'react';
import { View, Text } from 'react-native';
import styled from 'styled-components/native';

import { ClassItem } from '../../types/schedule';
import { SCHEDULE_CARD_HEIGHT, CARD_PADDING, SUBTEXT_SIZE } from '../../constants/style';

const ItemContainer = styled.View`
  flex-direction: row;
  align-items: stretch;
  height: ${SCHEDULE_CARD_HEIGHT};
  padding: ${CARD_PADDING};
`;

const DetailsContainer = styled.View`
  justify-content: center;
  align-items: center;
`;

const Title = styled(Text)`
  font-size: ${SUBTEXT_SIZE};
`;

interface ScheduleCardItemProps {
  scheduleItem: ClassItem;
}

export default function ScheduleCardItem({ scheduleItem }: ScheduleCardItemProps) {
  return (
    <ItemContainer>
      <DetailsContainer>
        <Title>{scheduleItem.title}</Title>
      </DetailsContainer>
    </ItemContainer>
  );
}
