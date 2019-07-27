import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Dialog from 'react-native-dialog';

import authorizedRoute from '../components/common/authorizedRoute';
import Button from '../components/drawer/Button';
import Switch from '../components/settings/Switch';
import { fetchUserInfo } from '../actions/async';
import { AppState, Theme } from '../types/store';
import { setTheme } from '../actions/creators';
import { darkTheme } from '../constants/theme';
import { notify } from '../utils/utils';
import ButtonGroup from '../components/drawer/ButtonGroup';
import client from '../utils/bugsnag';

export default authorizedRoute('Settings', function Settings() {
  const { username, password } = useSelector((state: AppState) => state.user);
  const theme = useSelector((state: AppState) => state.theme);
  const dispatch = useDispatch();
  // after an app restart, references are reset, so `theme` is not the same reference as either
  // light or dark theme, so instead we check if they stringify to the same string
  const [isDarkTheme, setIsDarkTheme] = useState(JSON.stringify(theme) === JSON.stringify(darkTheme));
  const [refreshing, setRefreshing] = useState(false);
  const [reportingBug, setReportingBug] = useState(false);
  const [bugReport, setBugReport] = useState('');

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await dispatch(fetchUserInfo(username, password));
      notify('Success', 'Your information has been refreshed.');
    } catch (error) {
      notify('Error', error);
    }
    setRefreshing(false);
  };

  const handleBugReport = () => {
    client.notify(new Error(bugReport));
    closeDialog();
  };

  const handleThemeChange = (newVal: boolean) => {
    dispatch(setTheme(newVal ? Theme.DARK : Theme.LIGHT));
    setIsDarkTheme(newVal);
  };

  const openDialog = () => setReportingBug(true);
  const closeDialog = () => setReportingBug(false);

  const accentStyle = { color: theme.accentColor };
  return (
    <>
      <ButtonGroup>
        <Button onPress={handleRefresh} disabled={refreshing} icon="refresh">Manual Refresh</Button>
        <Button onPress={openDialog} icon="warning">Report Bug</Button>
      </ButtonGroup>
      <Switch value={isDarkTheme} onChange={handleThemeChange}>Dark Theme</Switch>
      <Dialog.Container visible={reportingBug}>
        <Dialog.Title>Report Bug</Dialog.Title>
        <Dialog.Description>Please describe the bug. Note some anonymous diagnostic info is sent.</Dialog.Description>
        <Dialog.Input value={bugReport} onChangeText={setBugReport} />
        <Dialog.Button label="Cancel" onPress={closeDialog} style={accentStyle} />
        <Dialog.Button label="Report" onPress={handleBugReport} style={accentStyle} />
      </Dialog.Container>
    </>
  );
});
