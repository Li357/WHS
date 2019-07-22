import React from 'react';
import styled from 'styled-components/native';

import { CrossSectionedItem, CrossSectionedColumn, ClassItem } from '../../types/schedule';
import { getOccupiedMods, isHalfMod } from '../../utils/query-schedule';
import CardItem, { Title, BodyText } from './CardItem';
import { sum } from '../../utils/utils';
import { BORDER_WIDTH, SCHEDULE_CARD_ITEM_PADDING } from '../../constants/style';

const BlockContainer = styled.View`
  flex: 8;
  flex-direction: row;
`;

const ColumnContainer = styled.View<{ last: boolean }>`
  flex: 1;
  border-right-color: ${({ theme }) => theme.borderColor};
  border-right-width: ${({ last }) => last ? 0 : BORDER_WIDTH};
`;

const EmptyBlock = styled.View`
  background-color: ${({ theme }) => theme.foregroundColor};
`;

const DetailsContainer = styled.View`
  justify-content: center;
  align-items: center;
`;

const ColumnItem = styled.View``;

interface CrossSectionedCardItemProps {
  scheduleItem: CrossSectionedItem;
}

export default function CrossSectionedCardItem({ scheduleItem }: CrossSectionedCardItemProps) {
  const classMods = getOccupiedMods(scheduleItem);
  const flexRatios = classMods.map((mod) => isHalfMod(mod) ? 1 : 2);

  const createColumn = (
    { title, body, startMod, endMod, length, sourceId }: ClassItem,
    index: number,
    array: CrossSectionedColumn,
  ) => {
    const nextItem = array[index + 1];
    const modsUntilNext = (nextItem ? nextItem.startMod : classMods.slice(-1)[0]) - endMod;

    const prefix = startMod - classMods[0];
    const modEndIndex = prefix + length;

    const prefixFlex = sum(flexRatios.slice(0, prefix));
    const modItemFlex = sum(flexRatios.slice(prefix, modEndIndex));
    const flexBetweenNext = sum(flexRatios.slice(modEndIndex, modEndIndex + modsUntilNext));

    return (
      <ColumnItem key={sourceId} style={{ flex: modItemFlex + flexBetweenNext }}>
        {index === 0 && prefix !== 0 && <EmptyBlock style={{ flex: prefixFlex }} />}
        <DetailsContainer>
          <Title numberOfLines={3}>{title}</Title>
          {body.length > 0 && <BodyText numberOfLines={2}>{body}</BodyText>}
        </DetailsContainer>
        <EmptyBlock style={{ flex: flexBetweenNext }} />
      </ColumnItem>
    );
  };
  const columns = scheduleItem.columns.map((column, index, array) => (
    <ColumnContainer key={index} last={index === array.length - 1}>{column.map(createColumn)}</ColumnContainer>
  ));

  return (
    <CardItem type="course" scheduleItem={scheduleItem}>
      <BlockContainer>{columns}</BlockContainer>
    </CardItem>
  );
}
