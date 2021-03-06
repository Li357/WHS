import React, { useState } from 'react';
import { DrawerItemsProps } from 'react-navigation';
import { useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';
import styled from 'styled-components/native';

import Button from './Button';
import ButtonGroup from './ButtonGroup';
import { MAX_TEACHER_SCHEDULES } from '../../constants/store';
import { AppState } from '../../types/store';
import { TeacherSchedule, Schedule } from '../../types/schedule';
import { SUBTEXT_SIZE, INPUT_ACTIVE_COLOR } from '../../constants/style';

const DrawerIcon = styled(Icon)<{ focused: boolean }>`
  font-size: ${SUBTEXT_SIZE};
  color: ${({ theme, focused }) => focused ? INPUT_ACTIVE_COLOR : theme.subtextColor};
`;

export default function DrawerItems({
  items, activeItemKey,
  onItemPress, onSchedulePress,
  descriptors, navigation,
}: DrawerItemsProps) {
  const mySchedule = useSelector(({ user }: AppState) => user.schedule);
  const teacherSchedules = useSelector(({ user }: AppState) => user.teacherSchedules);
  const [activeIndex, setActiveIndex] = useState(-1);

  const updateIndex = (index: number, schedule: TeacherSchedule | Schedule) => () => {
    setActiveIndex(index);
    onSchedulePress(schedule);
    navigation.closeDrawer();
  };

  const drawerItems = items.map((route) => {
    const { drawerLabel = route.routeName, drawerIcon = '' } = descriptors[route.key].options || {};
    const name = drawerLabel as string;
    const icon = drawerIcon as string;

    const focused = activeItemKey === route.key;
    const itemHandler = () => {
      onItemPress({ route, focused });
      setActiveIndex(-1);
    };

    if (/My Schedule/.test(name)) {
      const myScheduleButton = (
        <Button
          key={route.key}
          left={<DrawerIcon name={icon} focused={focused && activeIndex === 0} />}
          onPress={updateIndex(0, mySchedule)}
        >
          {name}
        </Button>
      );
      const scheduleButtons = Array(MAX_TEACHER_SCHEDULES)
        .fill(undefined)
        .reduce((acc, _, scheduleIndex) => {
          const schedule = teacherSchedules[scheduleIndex];
          const scheduleHandler = updateIndex(scheduleIndex + 1, schedule);
          if (schedule === undefined) {
            return acc;
          }
          // Drawer item for a specific schedule
          const scheduleButton = (
            <Button key={`${route.key}-${scheduleIndex}`} onPress={scheduleHandler}>{schedule.name}</Button>
          );
          return [...acc, scheduleButton];
        }, [myScheduleButton]);
      // Schedule buttons are all in one ButtonGroup instead of single drawer items
      return (<ButtonGroup key={route.key} activeIndex={activeIndex}>{scheduleButtons}</ButtonGroup>);
    }
    return (
      <Button
        key={route.key}
        left={<DrawerIcon name={icon} focused={focused} />}
        active={focused}
        onPress={itemHandler}
      >
        {name}
      </Button>
    );
  });
  return (<>{drawerItems}</>);
}
