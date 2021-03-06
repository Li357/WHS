import React from 'react';
import { useSelector } from 'react-redux';
import Carousel from 'react-native-snap-carousel';
import styled from 'styled-components/native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import authorizedRoute from '../components/common/authorizedRoute';
import ScheduleCard from '../components/schedule/ScheduleCard';
import Subtext from '../components/common/Subtext';
import { ScheduleItem } from '../types/schedule';
import { wp } from '../utils/style';
import { SCREEN_MARGIN_HORIZONTAL, LARGE_ICON_SIZE } from '../constants/style';
import { isScheduleEmpty, getScheduleDay } from '../utils/query-schedule';
import { AppState } from '../types/store';
import client from '../utils/bugsnag';

const EmptyScreen = styled.View`
  height: 50%;
  justify-content: center;
  align-items: center;
  padding: 0 ${SCREEN_MARGIN_HORIZONTAL};
`;

const InfoText = styled(Subtext)`
  text-align: center;
`;

export default authorizedRoute(
  (navigation) => navigation.getParam('name', 'Schedule'),
  function Schedule({ navigation }) {
    const schedule = navigation.getParam('schedule', []);
    const theme = useSelector((state: AppState) => state.theme);
    const elearningPlans = useSelector((state: AppState) => state.elearningPlans);
    const customDates = useSelector((state: AppState) => state.customDates);

    if (isScheduleEmpty(schedule)) {
      client.leaveBreadcrumb('Schedule is empty');

      return (
        <EmptyScreen>
          <Icon name="restore" size={LARGE_ICON_SIZE} color={theme.subtextColor} />
          <InfoText numberOfLines={3}>
            Your schedule is empty. Navigate to Settings > Manual Refresh to update your schedule when school starts.
          </InfoText>
        </EmptyScreen>
      );
    }

    const renderItem = ({ item }: { item: ScheduleItem[]; index: number }) => (
      <ScheduleCard schedule={item} navigation={navigation} />
    );
    const { scheduleDay } = getScheduleDay(new Date(), customDates, elearningPlans);

    return (
      <Carousel
        loop={true}
        firstItem={Math.min(scheduleDay, 4)}
        data={schedule}
        renderItem={renderItem}
        sliderWidth={wp('100%')}
        itemWidth={wp('80%')}
        containerCustomStyle={{ flex: 1 }}
      />
    );
  },
  false,
);
