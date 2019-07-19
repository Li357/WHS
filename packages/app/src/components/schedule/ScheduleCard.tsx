import React from 'react';
import { Switch } from 'react-native';
import styled from 'styled-components/native';
import { useSelector } from 'react-redux';
import { setDay, format } from 'date-fns';

import Text from '../common/Text';
import { CARD_BORDER_RADIUS, CARD_PADDING, SUBTEXT_SIZE } from '../../constants/style';
import { ScheduleItem } from '../../types/schedule';
import { AppState } from '../../types/store';

const ScheduleCardContainer = styled.View`
  background-color: ${({ theme }) => theme.foregroundColor};
  border-radius: ${CARD_BORDER_RADIUS};
  padding: ${CARD_PADDING};
`;

const ScheduleCardHeader = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const Title = styled(Text)`
  font-size: ${SUBTEXT_SIZE};
`;

interface ScheduleCardProps {
  schedule: ScheduleItem[];
  day: number;
}

export default function ScheduleCard({ schedule, day }: ScheduleCardProps) {
  const { accentColor } = useSelector((state: AppState) => state.theme);
  const formattedDay = format(setDay(new Date(), day), 'MMMM d');

  return (
    <ScheduleCardContainer>
      <ScheduleCardHeader>
        <Title>{formattedDay}</Title>
        <Switch ios_backgroundColor={accentColor} trackColor={{ false: accentColor, true: accentColor }}/>
      </ScheduleCardHeader>
    </ScheduleCardContainer>
  );
}
