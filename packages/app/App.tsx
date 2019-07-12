import React from 'react';
import { StatusBar } from 'react-native';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { createSwitchNavigator, createAppContainer, createDrawerNavigator } from 'react-navigation';
import { ThemeProvider } from 'styled-components';

import Login from './src/screens/Login';
import Dashboard from './src/screens/Dashboard';
import Loading from './src/screens/Loading';
import Drawer from './src/components/drawer/Drawer';
import initializeStore from './src/utils/store';

const { store, persistor } = initializeStore();

function renderApp(isRehydrated: boolean) {
  if (isRehydrated) {
    const { user: { username, password }, theme } = store.getState();
    const isLoggedIn = username.length > 0 && password.length > 0;

    const Authorized = createDrawerNavigator(
      {
        Dashboard: { screen: Dashboard },
      },
      {
        initialRouteName: 'Dashboard',
        contentComponent: Drawer,
      },
    );
    const Navigator = createSwitchNavigator(
      {
        Login: { screen: Login },
        Authorized: { screen: Authorized },
      },
      { initialRouteName: isLoggedIn ? 'Authorized' : 'Login' },
    );
    const AppContainer = createAppContainer(Navigator);

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
