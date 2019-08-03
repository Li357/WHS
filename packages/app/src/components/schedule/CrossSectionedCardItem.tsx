import React from 'react';
import styled from 'styled-components/native';

import { CrossSectionedItem, CrossSectionedColumn, ClassItem } from '../../types/schedule';
import { getOccupiedMods, isHalfMod } from '../../utils/query-schedule';
import CardItem, { Title, BodyText } from './CardItem';
import { sum } from '../../utils/utils';
import { BORDER_WIDTH } from '../../constants/style';

const ColumnContainer = styled.View<{ last: boolean, empty: boolean }>`
  flex: 1;
  border-right-color: ${({ theme }) => theme.borderColor};
  border-right-width: ${({ last }) => last ? 0 : BORDER_WIDTH};
  background-color: ${({ theme, empty }) => empty ? theme.foregroundColor : theme.backgroundColor};
`;

const EmptyBlock = styled.View`
  background-color: ${({ theme }) => theme.foregroundColor};
`;

// height: 0 is a hack since flexBasis doesn't seem to work.
const DetailsContainer = styled.View<{ topBorder: boolean, bottomBorder: boolean }>`
  height: 0;
  justify-content: center;
  align-items: center;
  border-top-width: ${({ topBorder }) => topBorder ? BORDER_WIDTH : 0};
  border-top-color: ${({ theme }) => theme.borderColor};
  border-bottom-width: ${({ bottomBorder }) => bottomBorder ? BORDER_WIDTH : 0};
  border-bottom-color: ${({ theme }) => theme.borderColor};
`;

const ColumnItem = styled.View`
  justify-content: center;
  align-items: stretch;
`;

interface CrossSectionedCardItemProps {
  first: boolean;
  scheduleItem: CrossSectionedItem;
}

export default function CrossSectionedCardItem({ first, scheduleItem }: CrossSectionedCardItemProps) {
  const classMods = getOccupiedMods(scheduleItem);
  const flexRatios = classMods.map((mod) => isHalfMod(mod) ? 1 : 2);
  const crossSectionedStartMod = classMods[0];
  const crossSectionedEndMod = classMods.slice(-1)[0] + 1;

  const createColumn = (
    { title, body, startMod, endMod, length, sourceId }: ClassItem,
    index: number,
    array: CrossSectionedColumn,
  ) => {
    const nextItem = array[index + 1];
    const modsUntilNext = (nextItem ? nextItem.startMod : crossSectionedEndMod) - endMod;

    const prefix = startMod - crossSectionedStartMod;
    const modEndIndex = prefix + length;

    const prefixFlex = sum(flexRatios.slice(0, prefix));
    const modItemFlex = sum(flexRatios.slice(prefix, modEndIndex));
    const flexBetweenNext = sum(flexRatios.slice(modEndIndex, modEndIndex + modsUntilNext));

    return (
      <ColumnItem key={sourceId} style={{ flex: modItemFlex + flexBetweenNext }}>
        {index === 0 && prefix !== 0 && <EmptyBlock style={{ flex: prefixFlex }} />}
        <DetailsContainer
          topBorder={startMod !== crossSectionedStartMod}
          bottomBorder={nextItem !== undefined || endMod !== crossSectionedEndMod}
          style={{ flex: modItemFlex }}
        >
          <Title numberOfLines={3}>{title}</Title>
          {body.length > 0 && <BodyText numberOfLines={2}>{body}</BodyText>}
        </DetailsContainer>
        <EmptyBlock style={{ flex: flexBetweenNext }} />
      </ColumnItem>
    );
  };
  const columns = scheduleItem.columns.map((column, index, array) => (
    <ColumnContainer
      key={index}
      last={index === array.length - 1}
      empty={column.length === 0}
    >
      {column.map(createColumn)}
    </ColumnContainer>
  ));
  return (<CardItem first={first} type="course" scheduleItem={scheduleItem}>{columns}</CardItem>);
}
