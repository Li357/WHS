import React from 'react';
import Carousel from 'react-native-snap-carousel';
import styled from 'styled-components/native';

import authorizedRoute from '../components/common/authorizedRoute';
import ScheduleCard from '../components/schedule/ScheduleCard';
import Subtext from '../components/common/Subtext';
import { ScheduleItem } from '../types/schedule';
import { wp } from '../utils/style';
import { SCREEN_MARGIN_HORIZONTAL } from '../constants/style';
import { isScheduleEmpty } from '../utils/query-schedule';

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

    if (isScheduleEmpty(schedule)) {
      return (
        <EmptyScreen>
          <InfoText numberOfLines={3}>
            Your schedule is empty. Navigate to Settings > Manual Refresh to update your schedule when school starts.
          </InfoText>
        </EmptyScreen>
      );
    }

    const renderItem = ({ item }: { item: ScheduleItem[], index: number }) => (
      <ScheduleCard schedule={item} />
    );
    const currentDay = new Date().getDay();

    return (
      <Carousel
        loop={true}
        firstItem={Math.min(currentDay - 1, 4)}
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
