import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Dialog from 'react-native-dialog';
import styled from 'styled-components/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { CircleSnail } from 'react-native-progress';

import authorizedRoute from '../components/common/authorizedRoute';
import Button from '../components/drawer/Button';
import Switch from '../components/settings/Switch';
import { fetchUserInfo } from '../actions/async';
import { AppState, Theme } from '../types/store';
import { setTheme } from '../actions/creators';
import { darkTheme } from '../constants/theme';
import { notify, reportError } from '../utils/utils';
import ButtonGroup from '../components/drawer/ButtonGroup';
import client from '../utils/bugsnag';
import { SUBTEXT_SIZE, DIALOG_INPUT_BACKGROUND_COLOR } from '../constants/style';
import { scheduleNotifications } from '../utils/notifications';
import { LoginError } from '../utils/error';
import { LOGIN_CREDENTIALS_CHANGED_MSG } from '../constants/fetch';

const SettingIcon = styled(Icon)`
  font-size: ${SUBTEXT_SIZE};
  color: ${({ theme }) => theme.subtextColor};
`;

const BugReportInput = styled(Dialog.Input)`
  background-color: ${DIALOG_INPUT_BACKGROUND_COLOR};
`;

export default authorizedRoute('Settings', function Settings() {
  const { username, password } = useSelector((state: AppState) => state.user);
  const theme = useSelector((state: AppState) => state.theme);
  const dispatch = useDispatch();
  // after an app restart, references are reset, so `theme` is not the same reference as either
  // light or dark theme, so instead we check if they stringify to the same string
  const [isDarkTheme, setIsDarkTheme] = useState(JSON.stringify(theme) === JSON.stringify(darkTheme));
  const [refreshing, setRefreshing] = useState(false);
  const [reportingBug, setReportingBug] = useState(false);
  const [reported, setReported] = useState(false);
  const [bugReport, setBugReport] = useState('');

  const handleRefresh = async () => {
    setRefreshing(true);
    client.leaveBreadcrumb('Manual refreshing');

    try {
      await dispatch(fetchUserInfo(username, password));
      await scheduleNotifications();
      notify('Success', 'Your information has been refreshed.');
    } catch (error) {
      if (error instanceof LoginError) {
        return notify('Error', LOGIN_CREDENTIALS_CHANGED_MSG);
      }
      notify('Error', error);
      reportError(error);
    }
    setRefreshing(false);
  };

  const handleBugReport = () => {
    client.notify(new Error(bugReport));
    setReported(true);
  };

  const handleThemeChange = (newVal: boolean) => {
    const newTheme = newVal ? Theme.DARK : Theme.LIGHT;
    client.leaveBreadcrumb(`Changing theme to ${newTheme}`);

    dispatch(setTheme(newTheme));
    setIsDarkTheme(newVal);
  };

  const openDialog = () => setReportingBug(true);
  const closeDialog = () => setReportingBug(false);

  const refreshLeftElement = refreshing
    ? (<CircleSnail size={SUBTEXT_SIZE} color={theme.subtextColor} />)
    : (<SettingIcon name="refresh" />);

  const reportDialogContent = [
    <Dialog.Title key="0">Report Bug</Dialog.Title>,
    (
      <Dialog.Description key="1">
        Please describe the bug. Note some anonymous diagnostic info is sent.
      </Dialog.Description>
    ),
    <BugReportInput key="2" value={bugReport} onChangeText={setBugReport} />,
    <Dialog.Button key="3" label="Cancel" onPress={closeDialog} />,
    <Dialog.Button key="4" label="Report" onPress={handleBugReport} />,
  ];

  const reportedContent = [
    <Dialog.Title key="0">Reported</Dialog.Title>,
    (
      <Dialog.Description key="1">
        Bug reported submitted. You may be contacted for further information.
      </Dialog.Description>
    ),
    <Dialog.Button key="2" label="OK" onPress={closeDialog} />,
  ];

  return (
    <>
      <ButtonGroup>
        <Button
          onPress={handleRefresh}
          disabled={refreshing}
          left={refreshLeftElement}
        >
          Manual Refresh
        </Button>
        <Button onPress={openDialog} left={<SettingIcon name="warning" />}>Report Bug</Button>
      </ButtonGroup>
      <Switch value={isDarkTheme} onChange={handleThemeChange}>Dark Theme</Switch>
      <Dialog.Container visible={reportingBug}>{reported ? reportedContent : reportDialogContent}</Dialog.Container>
    </>
  );
});
