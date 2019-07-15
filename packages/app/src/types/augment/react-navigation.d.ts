import { NavigationDescriptor } from 'react-navigation';
import { Animated } from 'react-native';

import { TeacherSchedule, Schedule } from '../schedule';

declare module 'react-navigation' {
  export interface DrawerItemsProps {
    onSchedulePress: (schedule: TeacherSchedule | Schedule) => void;
    drawerOpenProgress: Animated.AnimatedInterpolation;
    descriptors: { [key: string]: NavigationDescriptor };
  }
}
