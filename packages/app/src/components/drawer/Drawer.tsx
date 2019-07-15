import React from 'react';
import styled from 'styled-components/native';
import { ScrollView } from 'react-native';
import { DrawerItemsProps } from 'react-navigation';
import { useDispatch } from 'react-redux';

import { DRAWER_MARGIN_HORIZONTAL } from '../../constants/style';
import Profile from './Profile';
import Button from './Button';
import { AppState, AppAction } from '../../types/store';
import { logOut } from '../../actions/creators';
import DrawerItems from './DrawerItems';
import { TeacherSchedule, Schedule } from '../../types/schedule';

const DrawerContainer = styled.View`
  flex: 1;
  margin: 0 ${DRAWER_MARGIN_HORIZONTAL};
`;

export default function Drawer(props: DrawerItemsProps) {
  const dispatch = useDispatch<AppState, AppAction>();
  const logout = () => {
    dispatch(logOut());
    props.navigation.navigate('Login');
  };

  const onSchedulePress = (schedule: TeacherSchedule | Schedule) => {
    const params = Array.isArray(schedule) ? { name: 'Schedule', schedule } : schedule;
    props.navigation.navigate('Schedule', params);
  };

  return (
    <DrawerContainer>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Profile />
        <DrawerItems onSchedulePress={onSchedulePress} {...props} />
        <Button icon="chevron-right" onPress={logout}>Logout</Button>
      </ScrollView>
    </DrawerContainer>
  );
}
