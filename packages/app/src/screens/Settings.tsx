import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import authorizedRoute from '../components/common/authorizedRoute';
import Button from '../components/drawer/Button';
import Switch from '../components/settings/Switch';
import { fetchUserInfo } from '../actions/async';
import { AppState, Theme } from '../types/store';
import { setTheme } from '../actions/creators';
import { darkTheme } from '../constants/theme';

export default authorizedRoute('Settings', function Settings() {
  const { username, password } = useSelector((state: AppState) => state.user);
  const theme = useSelector((state: AppState) => state.theme);
  const dispatch = useDispatch();
  // after an app restart, references are reset, so `theme` is not the same reference as either
  // light or dark theme, so instead we check if they stringify to the same string
  const [isDarkTheme, setIsDarkTheme] = useState(JSON.stringify(theme) === JSON.stringify(darkTheme));

  const handleRefresh = () => {
    dispatch(fetchUserInfo(username, password));
    // TODO: Dialog
  };

  const handleBugReport = () => {
    // TODO: Dialog and send to bugsnag
  }

  const handleThemeChange = (newVal: boolean) => {
    dispatch(setTheme(newVal ? Theme.DARK : Theme.LIGHT));
    setIsDarkTheme(newVal);
  };

  // TODO: Bigger icons!
  return (
    <>
      <Button onPress={handleRefresh} icon="refresh">Manual Refresh</Button>
      <Button onPress={handleBugReport} icon="warning">Report Bug</Button>
      <Switch value={isDarkTheme} onChange={handleThemeChange}>Dark Theme</Switch>
    </>
  );
});
