import React, { useState, useMemo } from 'react';
import { Switch, ScrollView } from 'react-native';
import styled from 'styled-components/native';
import { useSelector } from 'react-redux';
import { setDay, format } from 'date-fns';
import { createSelector } from 'reselect';

import Text from '../common/Text';
import { CARD_BORDER_RADIUS, CARD_PADDING, SUBTEXT_SIZE, BORDER_WIDTH } from '../../constants/style';
import { ClassItem, CrossSectionedItem, ScheduleItem } from '../../types/schedule';
import { AppState } from '../../types/store';
import { getScheduleTypeOnDate } from '../../utils/query-schedule';
import * as SCHEDULES from '../../constants/schedules';
import { interpolateAssembly, getFinalsSchedule, createClassItem } from '../../utils/process-schedule';
import ClassCardItem from './ClassCardItem';
import CrossSectionedCardItem from './CrossSectionedCardItem';
import Subtext from '../common/Subtext';
import { formatTime } from '../../utils/duration';

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

const ClassesContainer = styled.View`
  flex: 1;
`;

const Title = styled(Text)`
  font-size: ${SUBTEXT_SIZE};
`;

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

    const wednesdayShift = currentDay === 3 ? 1 : 0;
    const cardDaySchedule = daySchedule.map(([start, end], index) => {
      const startTime = formatTime(start);
      const endTime = formatTime(end);
      return createClassItem(
        `${startTime} - ${endTime}`, '', index + wednesdayShift, index + wednesdayShift + 1, day, 'course',
      );
    });
    return { cardDate, cardDaySchedule, userDaySchedule, isCurrentDay, isFinals };
  },
);
export default function ScheduleCard({ schedule }: ScheduleCardProps) {
  const [showTimes, setShowTimes] = useState(false);
  const { accentColor, borderColor, backgroundColor } = useSelector((state: AppState) => state.theme);

  const cardDayScheduleSelector = useMemo(makeCardDayScheduleSelector, []);
  const {
    cardDate,
    cardDaySchedule,
    userDaySchedule,
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
          trackColor={{ false: borderColor, true: accentColor }}
        />
      </Header>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Body>
          <ClassesContainer>{classes}</ClassesContainer>
        </Body>
      </ScrollView>
    </ScheduleCardContainer>
  );
}
