import React from 'react';

import Card from './Card';
import BadgeButton from './BadgeButton';
import Text from '../common/Text';
import Subtext from '../common/Subtext';
import { DashboardInfo } from '../../types/dashboard-info';

export default function CrossSectionedCard({ title, name }: DashboardInfo) {
  return (
    <Card warning={true}>
      <Text>{title}</Text>
      <BadgeButton>CHECK SCHEDULE</BadgeButton>
      {name !== undefined && <Subtext>{name}</Subtext>}
    </Card>
  );
}
