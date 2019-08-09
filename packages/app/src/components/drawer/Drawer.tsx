import React from 'react';
import styled from 'styled-components/native';
import { ScrollView } from 'react-native';
import { DrawerItemsProps } from 'react-navigation';
import { useDispatch, useSelector } from 'react-redux';
import PushNotification from 'react-native-push-notification';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { DRAWER_MARGIN_HORIZONTAL, SUBTEXT_SIZE } from '../../constants/style';
import Profile from './Profile';
import Button from './Button';
import { logOut } from '../../actions/creators';
import DrawerItems from './DrawerItems';
import { TeacherSchedule, Schedule } from '../../types/schedule';
import { AppState } from '../../types/store';

const DrawerContainer = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.backgroundColor};
  padding: 0 ${DRAWER_MARGIN_HORIZONTAL};
`;

const LogoutIcon = styled(Icon)`
  font-size: ${SUBTEXT_SIZE};
  color: ${({ theme }) => theme.subtextColor};
`;

export default function Drawer(props: DrawerItemsProps) {
  const userInfo = useSelector((state: AppState) => state.user);
  const dispatch = useDispatch();
  const logout = () => {
    dispatch(logOut());
    PushNotification.cancelAllLocalNotifications();
    props.navigation.navigate('Login');
  };

  const onSchedulePress = (schedule: TeacherSchedule | Schedule) => {
    const params = Array.isArray(schedule) ? { name: 'Schedule', schedule } : schedule;
    props.navigation.navigate('Schedule', params);
  };

  return (
    <DrawerContainer>
      <Profile userInfo={userInfo} />
      <ScrollView showsVerticalScrollIndicator={false}>
        <DrawerItems onSchedulePress={onSchedulePress} {...props} />
        <Button left={<LogoutIcon name="chevron-right" />} onPress={logout}>Logout</Button>
      </ScrollView>
    </DrawerContainer>
  );
}
