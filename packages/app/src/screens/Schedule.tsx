import React from 'react';
import Carousel from 'react-native-snap-carousel';

import authorizedRoute from '../components/common/authorizedRoute';
import ScheduleCard from '../components/schedule/ScheduleCard';
import { ScheduleItem } from '../types/schedule';
import { wp } from '../utils/style';

export default authorizedRoute(
  (navigation) => navigation.getParam('name', 'Schedule'),
  function Schedule({ navigation }) {
    const schedule = navigation.getParam('schedule', []);

    if (schedule.length === 0) {
      // TODO: Handle empty schedule
      return null;
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
