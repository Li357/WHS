import React from 'react';
import styled from 'styled-components/native';

import { ClassItem } from '../../types/schedule';
import CardItem, { Title, BodyText } from './CardItem';

const DetailsContainer = styled.View`
  justify-content: center;
  align-items: center;
  flex: 8;
`;

interface ScheduleCardItemProps {
  scheduleItem: ClassItem;
  isFinals: boolean;
}

export default function ScheduleCardItem({ scheduleItem, isFinals }: ScheduleCardItemProps) {
  const { title, body, sourceType } = scheduleItem;
  return (
    <CardItem type={sourceType} isFinals={isFinals} scheduleItem={scheduleItem}>
      <DetailsContainer>
        <Title numberOfLines={undefined}>{title}</Title>
        {body.length > 0 && <BodyText numberOfLines={2}>{body}</BodyText>}
      </DetailsContainer>
    </CardItem>
  );
}