import React, { memo } from 'react';
import { View } from 'react-native';
import Carousel from 'react-native-snap-carousel';

import authorizedRoute from '../components/common/authorizedRoute';
import ScheduleCard from '../components/schedule/ScheduleCard';
import { ScheduleItem } from '../types/schedule';
import { wp } from '../utils/style';

export default authorizedRoute(
  (navigation) => navigation.getParam('name', 'Schedule'),
  memo(function Schedule({ navigation }) {
    const schedule = navigation.getParam('schedule', []);

    if (schedule.length === 0) {
      // TODO: Handle empty schedule
      return (
        <View></View>
      );
    }

    const currentDay = new Date().getDay();
    const renderItem = ({ item, index }: { item: ScheduleItem[], index: number }) => (
      <ScheduleCard schedule={item} day={index + 1} />
    );

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
  }),
  false,
);
