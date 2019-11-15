import React, { useState, useMemo, useEffect } from 'react';
import { Switch, ScrollView, AppState as RNAppState, AppStateStatus } from 'react-native';
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
import { interpolateAssembly, getFinalsSchedule, createClassItem, injectAssemblyOrFinalsIfNeeded } from '../../utils/process-schedule';
import ClassCardItem from './ClassCardItem';
import CrossSectionedCardItem from './CrossSectionedCardItem';
import Subtext from '../common/Subtext';
import { formatTime } from '../../utils/duration';
import { sum } from '../../utils/utils';
import { NavigationProp } from '../../types/utils';

const ScheduleCardContainer = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.backgroundColor};
  border-top-left-radius: ${CARD_BORDER_RADIUS};
  border-top-right-radius: ${CARD_BORDER_RADIUS};
  border: ${BORDER_WIDTH} solid ${({ theme }) => theme.borderColor};
  overflow: hidden;
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

const ScheduleBody = styled(Body)`
  border-top-color: ${({ theme }) => theme.borderColor};
  border-top-width: ${BORDER_WIDTH};
  border-bottom-color: ${({ theme }) => theme.borderColor};
  border-bottom-width: ${BORDER_WIDTH};
`;

const BarContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
`;

const VerticalBar = styled(Bar)`
  transform: rotate(90deg);
`;

const ClassesContainer = styled.View<{ isCurrentDay: boolean }>`
  flex: 9;
  border-left-color: ${({ theme }) => theme.borderColor};
  border-left-width: ${({ isCurrentDay }) => isCurrentDay ? BORDER_WIDTH : 0};
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
      searchMod = next === ModNumber.ASSEMBLY ? ModNumber.TWO : next - 1;
  }

  const index = daySchedule.findIndex(([, , mod]) => mod === searchMod);
  const modHeights = daySchedule.map(([, , mod]) => (
    SCHEDULE_CARD_ITEM_HEIGHT / (isHalfMod(mod) || mod === ModNumber.HOMEROOM ? 2 : 1)
  ));
  const finishedHeight = sum(modHeights.slice(0, index));
  const totalHeight = sum(modHeights);

  const [startTime, endTime] = daySchedule[index];
  const start = convertTimeToDate(startTime, date);
  const end = convertTimeToDate(endTime, date);
  const partialCompletionRatio = Math.min(1, differenceInSeconds(date, start) / differenceInSeconds(end, start));
  const partialHeight = modHeights[index] * partialCompletionRatio;
  return (finishedHeight + partialHeight) / totalHeight;
}

interface ScheduleCardProps {
  schedule: ScheduleItem[];
  navigation: NavigationProp;
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

    const revisedUserDaySchedule = injectAssemblyOrFinalsIfNeeded(schedule, scheduleType, day);
    // Remove homeroom/no homeroom item on wednesday schedules
    const userDaySchedule = revisedUserDaySchedule.slice(scheduleType === 'WEDNESDAY' ? 1 : 0);

    const cardDaySchedule = daySchedule.map(([start, end, modNumber]) => {
      const startTime = formatTime(start);
      const endTime = formatTime(end);
      const isAssembly = modNumber === ModNumber.ASSEMBLY;
      return createClassItem(
        `${startTime} - ${endTime}`, '', modNumber, isAssembly ? ModNumber.FOUR : modNumber + 1, day, 'course',
      );
    });
    return { cardDate, cardDaySchedule, daySchedule, userDaySchedule, isCurrentDay, isFinals };
  },
);
export default function ScheduleCard({ schedule, navigation }: ScheduleCardProps) {
  const cardDayScheduleSelector = useMemo(makeCardDayScheduleSelector, []);
  const {
    cardDate,
    cardDaySchedule,
    userDaySchedule,
    daySchedule,
    isCurrentDay,
    isFinals,
  } = useSelector((state: AppState) => cardDayScheduleSelector(state, schedule));

  const [showTimes, setShowTimes] = useState(false);
  const [progress, setProgress] = useState(isCurrentDay ? getDayProgress(new Date(), daySchedule) : 0);
  const { accentColor, backgroundColor } = useSelector((state: AppState) => state.theme);

  const updateDayProgress = (newStatus: AppStateStatus) => {
    if (isCurrentDay && newStatus === 'active') {
      setProgress(getDayProgress(new Date(), daySchedule));
    }
  };
  useEffect(() => {
    RNAppState.addEventListener('change', updateDayProgress);
    return () => RNAppState.removeEventListener('change', updateDayProgress);
  }, [isCurrentDay, daySchedule]);
  useEffect(() => {
    const willFocusSubscription = navigation.addListener('willFocus', () => updateDayProgress('active'));
    return () => willFocusSubscription.remove();
  }, [isCurrentDay, daySchedule]);

  const formattedDay = `${format(cardDate, ' iiii')} `;
  const formattedDate = format(cardDate, 'MMM d');
  const scheduleToShow = showTimes ? cardDaySchedule : userDaySchedule!;

  const classes = scheduleToShow.map((scheduleItem, index) => {
    if (scheduleItem.hasOwnProperty('columns')) {
      return (
        <CrossSectionedCardItem
          key={scheduleItem.sourceId}
          first={index === 0}
          scheduleItem={scheduleItem as CrossSectionedItem}
        />
      );
    }
    return (
      <ClassCardItem
        key={scheduleItem.sourceId}
        first={index === 0}
        scheduleItem={scheduleItem as ClassItem}
        isFinals={isFinals}
      />
    );
  });
  const totalHeight = sum(daySchedule.map(([, , mod]) => (
    SCHEDULE_CARD_ITEM_HEIGHT / (isHalfMod(mod) || mod === ModNumber.HOMEROOM ? 2 : 1)
  )));
  const progressBar = (
    <BarContainer>
      <VerticalBar width={totalHeight} progress={progress} color={accentColor} />
    </BarContainer>
  );

  return (
    <ScheduleCardContainer>
      <Header>
        <Body>
          <Title minimumFontScale={0.5}>{formattedDay}</Title>
          <Subtext minimumFontScale={0.5}>{formattedDate}</Subtext>
        </Body>
        <Switch
          value={showTimes}
          onValueChange={setShowTimes}
          ios_backgroundColor={showTimes ? accentColor : backgroundColor}
          trackColor={{ true: accentColor }}
        />
      </Header>
      <ScrollView showsVerticalScrollIndicator={false}>
        <ScheduleBody>
          {isCurrentDay && progressBar}
          <ClassesContainer isCurrentDay={isCurrentDay}>{classes}</ClassesContainer>
        </ScheduleBody>
      </ScrollView>
    </ScheduleCardContainer>
  );
}
