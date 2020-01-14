import React, { memo, useState } from 'react';
import { KeyboardAvoidingView, Platform } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components/native';
import { NavigationScreenProps } from 'react-navigation';
import { CircleSnail } from 'react-native-progress';

import Screen from '../components/common/Screen';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import Text from '../components/common/Text';
import { fetchUserInfo, fetchDates } from '../actions/async';
import { AppState } from '../types/store';
import { LOGIN_HEADER_MARGIN, LOGIN_IMAGE_SIZE, SUBTEXT_SIZE } from '../constants/style';
import { getScheduleTypeOnDate } from '../utils/query-schedule';
import { setDaySchedule } from '../actions/creators';
import WHS from '../../assets/images/WHS.png';
import { reportError } from '../utils/utils';
import client from '../utils/bugsnag';
import { hp } from '../utils/style';
import registerNotificationScheduler, { scheduleNotifications } from '../utils/notifications';
import { LoginError } from '../utils/error';

const LoginScreen = styled(Screen)`
  align-items: center;
  justify-content: center;
`;

const Header = styled(Text)`
  margin: ${LOGIN_HEADER_MARGIN} 0;
`;

const Image = styled.Image`
  height: ${LOGIN_IMAGE_SIZE};
`;

export default memo(function Login(props: NavigationScreenProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const dates = useSelector((state: AppState) => state.dates);
  const theme = useSelector((state: AppState) => state.theme);
  const dispatch = useDispatch();

  const handleLogin = async () => {
    setLoading(true);
    client.leaveBreadcrumb('Attempting to log in');
    // If dates fail to be fetched, this is not a problem as they are refetched on app start
    // Fetch dates first b/c the latter sets credentials and makes user "logged in"

    // workaround since dates from useSelector doesn't seem to be updated
    let updatedDates = dates;
    try {
      updatedDates = await dispatch(fetchDates());
      // tslint:disable-next-line: no-empty
    } catch (error) {}

    try {
      const now = new Date();

      client.leaveBreadcrumb('Login: Fetching user info');
      await dispatch(fetchUserInfo(username, password));

      client.leaveBreadcrumb('Login: Registering scheduler');
      await registerNotificationScheduler();

      client.leaveBreadcrumb('Login: Scheduling notifications');
      await scheduleNotifications();

      client.leaveBreadcrumb('Set day schedule');
      dispatch(setDaySchedule(getScheduleTypeOnDate(now, updatedDates)));
      props.navigation.navigate('Dashboard');
    } catch (error) {
      if (error instanceof LoginError) {
        setError(true);
      } else {
        reportError(error);
        // 3.0.1-b6, weird bug prevent login, extra notify to debug
        client.notify(error);
      }
      setLoading(false);
    }
  };

  const canLogin = username.length > 0 && password.length > 0 && !loading;
  const containerStyle = { flex: 1 };

  return (
    <KeyboardAvoidingView
      behavior="position"
      style={containerStyle}
      contentContainerStyle={containerStyle}
      keyboardVerticalOffset={-hp('20%')}
      enabled={Platform.OS === 'ios'}
    >
      <LoginScreen>
        <Image source={WHS} resizeMode="contain" />
        <Header>Login to WHS</Header>
        <Input
          placeholder="Username"
          value={username}
          onChangeText={setUsername}
          error={error}
          textContentType="username"
        />
        <Input
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          error={error}
          secureTextEntry={true}
          textContentType="password"
        />
        <Button onPress={handleLogin} disabled={!canLogin}>
          {loading ? <CircleSnail size={SUBTEXT_SIZE} color={theme.foregroundColor} /> : 'Login'}
        </Button>
      </LoginScreen>
    </KeyboardAvoidingView>
  );
});
