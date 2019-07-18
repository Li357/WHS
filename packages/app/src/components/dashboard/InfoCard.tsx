import React from 'react';
import styled from 'styled-components/native';

import Card from './Card';
import Text from '../common/Text';
import Subtext from '../common/Subtext';
import { DashboardInfo } from '../../types/dashboard-info';

const Description = styled(Subtext)`
  color: ${({ theme }) => theme.textColor};
`;

export default function InfoCard({ title, subtitle, name }: DashboardInfo) {
  return (
    <Card>
      <Text numberOfLines={2}>{title}</Text>
      {subtitle && <Description>{subtitle}</Description>}
      {name && <Subtext>{name}</Subtext>}
    </Card>
  );
}
