import React from 'react';
import { StatusBar } from 'react-native';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import {
  createSwitchNavigator, createAppContainer, createDrawerNavigator,
  NavigationRouteConfigMap,
} from 'react-navigation';
import { ThemeProvider } from 'styled-components';

import Login from './src/screens/Login';
import Dashboard from './src/screens/Dashboard';
import Schedule from './src/screens/Schedule';
import Loading from './src/screens/Loading';
import Drawer from './src/components/drawer/Drawer';
import initializeStore from './src/utils/store';

const { store, persistor } = initializeStore();

function createNavigationContainer(isLoggedIn: boolean) {
  const Authorized = createDrawerNavigator({
    Dashboard: {
      screen: Dashboard,
      navigationOptions: { drawerIcon: 'dashboard' },
    },
    Schedule: {
      screen: Schedule,
      navigationOptions: {
        drawerIcon: 'schedule',
        drawerLabel: 'My Schedule',
      },
    },
  }, {
    initialRouteName: 'Dashboard',
    contentComponent: Drawer,
  });
  const Navigator = createSwitchNavigator({
    Login: { screen: Login },
    Authorized: { screen: Authorized },
  }, { initialRouteName: isLoggedIn ? 'Authorized' : 'Login' });
  return createAppContainer(Navigator);
}

function updateDayInfoIfNeeded(lastUpdate: Date | null, today: number) {
  
}

function renderApp(isRehydrated: boolean) {
  if (isRehydrated) {
    const { user: { username, password }, theme, day: { lastStateUpdate } } = store.getState();
    const isLoggedIn = username.length > 0 && password.length > 0;
    const now = new Date();
    
    updateDayInfoIfNeeded(lastStateUpdate, now.getDay());

    const AppContainer = createNavigationContainer(isLoggedIn);
    return (
      <ThemeProvider theme={theme}>
        <>
          <StatusBar barStyle={theme.statusBar} />
          <AppContainer />
        </>
      </ThemeProvider>
    );
  }

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <Loading />
    </>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <PersistGate persistor={persistor}>{renderApp}</PersistGate>
    </Provider>
  );
}
