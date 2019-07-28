import React, { useState, useMemo } from 'react';
import { Switch, ScrollView } from 'react-native';
import styled from 'styled-components/native';
import { useSelector } from 'react-redux';
import { setDay, format, differenceInSeconds } from 'date-fns';
import { createSelector } from 'reselect';
import { Bar } from 'react-native-progress';

import Text from '../common/Text';
import {
  CARD_BORDER_RADIUS, CARD_PADDING, SUBTEXT_SIZE,
  BORDER_WIDTH, SCHEDULE_CARD_ITEM_HEIGHT,
} from '../../constants/style';
import { ClassItem, CrossSectionedItem, ScheduleItem, DaySchedule, ModNumber } from '../../types/schedule';
import { AppState } from '../../types/store';
import { getScheduleTypeOnDate, getModAtTime, isHalfMod, convertTimeToDate } from '../../utils/query-schedule';
import * as SCHEDULES from '../../constants/schedules';
import { interpolateAssembly, getFinalsSchedule, createClassItem } from '../../utils/process-schedule';
import ClassCardItem from './ClassCardItem';
import CrossSectionedCardItem from './CrossSectionedCardItem';
import Subtext from '../common/Subtext';
import { formatTime } from '../../utils/duration';
import { sum } from '../../utils/utils';

const ScheduleCardContainer = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.backgroundColor};
  border-radius: ${CARD_BORDER_RADIUS};
  border: ${BORDER_WIDTH} solid ${({ theme }) => theme.borderColor};
`;

const Header = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: ${CARD_PADDING};
  border-bottom-color: ${({ theme }) => theme.borderColor};
  border-bottom-width: ${BORDER_WIDTH};
`;

const Body = styled.View`
  flex-direction: row;
`;

const BarContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
`;

const VerticalBar = styled(Bar)`
  transform: rotate(90deg);
`;

const ClassesContainer = styled.View`
  flex: 9;
`;

const Title = styled(Text)`
  font-size: ${SUBTEXT_SIZE};
`;

function getDayProgress(date: Date, daySchedule: DaySchedule) {
  const { current, next } = getModAtTime(date, daySchedule);
  let searchMod = current;
  switch (current) {
    case ModNumber.BEFORE_SCHOOL:
      return 0;
    case ModNumber.AFTER_SCHOOL:
      return 1;
    case ModNumber.PASSING_PERIOD:
      searchMod = next - 1;
  }

  const index = daySchedule.findIndex(([, , mod]) => mod === searchMod);
  const modHeights = daySchedule.map(([, , mod]) => SCHEDULE_CARD_ITEM_HEIGHT / (isHalfMod(mod) ? 2 : 1));
  const finishedHeight = sum(modHeights.slice(0, index));
  const totalHeight = sum(modHeights);

  const [startTime, endTime] = daySchedule[index];
  const start = convertTimeToDate(startTime, date);
  const end = convertTimeToDate(endTime, date);
  const partialCompletionRatio = Math.max(0, differenceInSeconds(end, date) / differenceInSeconds(end, start));
  const partialHeight = SCHEDULE_CARD_ITEM_HEIGHT * partialCompletionRatio;
  return (finishedHeight + partialHeight) / totalHeight;
}

interface ScheduleCardProps {
  schedule: ScheduleItem[];
}

const makeCardDayScheduleSelector = () => createSelector(
  (state: AppState) => state.dates,
  (_: any, schedule: ScheduleItem[]) => schedule,
  (dates, schedule) => {
    const { day } = schedule[0];
    const now = new Date();
    const currentDay = now.getDay();
    const cardDate = setDay(now, day);
    const scheduleType = getScheduleTypeOnDate(cardDate, dates, true);
    const daySchedule = SCHEDULES[scheduleType];
    const isCurrentDay = currentDay === day;
    const isFinals = scheduleType === 'FINALS';

    let userDaySchedule;
    if (daySchedule === SCHEDULES.ASSEMBLY && !isCurrentDay) {
      userDaySchedule = interpolateAssembly(schedule, day);
    } else if (daySchedule === SCHEDULES.FINALS && !isCurrentDay) {
      userDaySchedule = getFinalsSchedule(schedule, day);
    } else {
      userDaySchedule = schedule.filter((scheduleItem) => (scheduleItem as ClassItem).title !== 'No Homeroom');
    }

    const cardDaySchedule = daySchedule.map(([start, end, modNumber]) => {
      const startTime = formatTime(start);
      const endTime = formatTime(end);
      return createClassItem(
        `${startTime} - ${endTime}`, '', modNumber, modNumber + 1, day, 'course',
      );
    });
    return { cardDate, cardDaySchedule, daySchedule, userDaySchedule, isCurrentDay, isFinals };
  },
);
export default function ScheduleCard({ schedule }: ScheduleCardProps) {
  const [showTimes, setShowTimes] = useState(false);
  const { accentColor, backgroundColor } = useSelector((state: AppState) => state.theme);

  const cardDayScheduleSelector = useMemo(makeCardDayScheduleSelector, []);
  const {
    cardDate,
    cardDaySchedule,
    userDaySchedule,
    daySchedule,
    isCurrentDay,
    isFinals,
  } = useSelector((state: AppState) => cardDayScheduleSelector(state, schedule));

  const formattedDay = `${format(cardDate, ' iiii')} `;
  const formattedDate = format(cardDate, 'MMM d');
  const scheduleToShow = showTimes ? cardDaySchedule : userDaySchedule!;

  const classes = scheduleToShow.map((scheduleItem) => {
    if (scheduleItem.hasOwnProperty('columns')) {
      return (<CrossSectionedCardItem key={scheduleItem.sourceId} scheduleItem={scheduleItem as CrossSectionedItem} />);
    }
    return (
      <ClassCardItem
        key={scheduleItem.sourceId}
        scheduleItem={scheduleItem as ClassItem}
        isFinals={isFinals}
      />
    );
  });
  const totalHeight = sum(daySchedule.map(([, , mod]) => (
    SCHEDULE_CARD_ITEM_HEIGHT / (isHalfMod(mod) || mod === ModNumber.HOMEROOM ? 2 : 1)
  )));
  const dayProgress = isCurrentDay ? getDayProgress(new Date(), daySchedule) : 0;

  return (
    <ScheduleCardContainer>
      <Header>
        <Body>
          <Title>{formattedDay}</Title>
          <Subtext>{formattedDate}</Subtext>
        </Body>
        <Switch
          value={showTimes}
          onValueChange={setShowTimes}
          ios_backgroundColor={showTimes ? accentColor : backgroundColor}
          trackColor={{ true: accentColor }}
        />
      </Header>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Body>
          {isCurrentDay && <BarContainer><VerticalBar width={totalHeight} progress={dayProgress} /></BarContainer>}
          <ClassesContainer>{classes}</ClassesContainer>
        </Body>
      </ScrollView>
    </ScheduleCardContainer>
  );
}
