import React, { useState, useMemo } from 'react';
import { Switch, ScrollView } from 'react-native';
import styled from 'styled-components/native';
import { useSelector } from 'react-redux';
import { setDay, format } from 'date-fns';
import { Bar } from 'react-native-progress';
import { createSelector } from 'reselect';

import Text from '../common/Text';
import { CARD_BORDER_RADIUS, CARD_PADDING, SUBTEXT_SIZE } from '../../constants/style';
import { ClassItem, CrossSectionedItem, ScheduleItem } from '../../types/schedule';
import { AppState } from '../../types/store';
import { getScheduleTypeOnDate } from '../../utils/query-schedule';
import * as SCHEDULES from '../../constants/schedules';
import { interpolateAssembly, getFinalsSchedule } from '../../utils/process-schedule';
import ScheduleCardItem from './ScheduleCardItem';
import CrossSectionedCardItem from './CrossSectionedCardItem';

const ScheduleCardContainer = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.foregroundColor};
  border-radius: ${CARD_BORDER_RADIUS};
`;

const Header = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: ${CARD_PADDING};
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
    const daySchedule = SCHEDULES[getScheduleTypeOnDate(cardDate, dates, true)];
    const isCurrentDay = currentDay === day;

    let userDaySchedule;
    if (daySchedule === SCHEDULES.ASSEMBLY && !isCurrentDay) {
      userDaySchedule = interpolateAssembly(schedule);
    } else if (daySchedule === SCHEDULES.FINALS && !isCurrentDay) {
      userDaySchedule = getFinalsSchedule(schedule);
    } else {
      userDaySchedule = schedule.filter((scheduleItem) => (scheduleItem as ClassItem).title !== 'No Homeroom');
    }

    const wednesdayShift = currentDay === 3 ? 1 : 0;
    const cardDaySchedule = daySchedule.map(([start, end], index) => ({
      title: `${start} - ${end}`,
      body: '',
      roomNumber: '',
      day,
      length: 1,
      startMod: index + wednesdayShift,
      endMod: index + 1 + wednesdayShift,
      sourceId: index,
      sourceType: 'course',
    }));
    return { cardDate, cardDaySchedule, userDaySchedule, isCurrentDay };
  },
);
export default function ScheduleCard({ schedule }: ScheduleCardProps) {
  const [showTimes, setShowTimes] = useState(false);
  const { accentColor } = useSelector((state: AppState) => state.theme);

  const cardDayScheduleSelector = useMemo(makeCardDayScheduleSelector, []);
  const {
    cardDate,
    cardDaySchedule,
    userDaySchedule,
    isCurrentDay,
  } = useSelector((state: AppState) => cardDayScheduleSelector(state, schedule));
  const formattedDay = format(cardDate, 'MMMM d');
  const scheduleToShow = showTimes ? cardDaySchedule : userDaySchedule!;
  const classes = scheduleToShow.map((scheduleItem) => {
    if ((scheduleItem as CrossSectionedItem).columns !== undefined) {
      return (<CrossSectionedCardItem key={scheduleItem.sourceId} scheduleItem={scheduleItem as CrossSectionedItem} />);
    }
    return (<ScheduleCardItem key={scheduleItem.sourceId} scheduleItem={scheduleItem as ClassItem} />);
  });

  return (
    <ScheduleCardContainer>
      <Header>
        <Title>{formattedDay}</Title>
        <Switch
          onValueChange={setShowTimes}
          ios_backgroundColor={accentColor}
          trackColor={{ false: accentColor, true: accentColor }}
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
