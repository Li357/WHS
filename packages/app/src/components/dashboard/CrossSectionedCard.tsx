import React from 'react';
import styled from 'styled-components/native';

import Text from '../common/Text';
import Subtext from '../common/Subtext';
import { DashboardInfo } from '../../types/dashboard-info';
import CrossSectionedCardItem from '../schedule/CrossSectionedCardItem';
import { CrossSectionedItem } from '../../types/schedule';
import { CARD_MARGIN_BOTTOM, CARD_PADDING, CARD_BORDER_WIDTH, CARD_BORDER_RADIUS } from '../../constants/style';

const CardContainer = styled.View`
  margin-bottom: ${CARD_MARGIN_BOTTOM};
  align-items: stretch;
  background-color: ${({ theme }) => theme.foregroundColor};
  border: ${CARD_BORDER_WIDTH} solid ${({ theme }) => theme.accentColor};
  border-radius: ${CARD_BORDER_RADIUS};
  zIndex: 3;
`;

const CardItemContainer = styled.View`
  overflow: hidden;
  border-radius: ${CARD_BORDER_RADIUS};
  zIndex: 2;
  border: ${CARD_BORDER_WIDTH} solid ${({ theme }) => theme.borderColor}
`;

const Body = styled.View`
  padding: ${CARD_PADDING};
`;

export default function CrossSectionedCard({ title, name, scheduleItem }: DashboardInfo) {
  return (
    <CardContainer>
      <CardItemContainer>
        <CrossSectionedCardItem first={false} scheduleItem={scheduleItem as CrossSectionedItem} />
      </CardItemContainer>
      <Body>
        <Text>{title}</Text>
        {name !== undefined && <Subtext>{name}</Subtext>}
      </Body>
    </CardContainer>
  );
}
