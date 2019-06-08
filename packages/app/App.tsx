import React from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { createSwitchNavigator, createAppContainer } from 'react-navigation';
import { ThemeProvider } from 'styled-components';

import Screen from './src/components/Screen';
import Login from './src/screens/Login';
import initializeStore from './src/utils/store';

const { store, persistor } = initializeStore();

function renderApp(isRehydrated: boolean) {
  if (isRehydrated) {
    const { user: { username, password }, theme } = store.getState();
    const isLoggedIn = username.length > 0 && password.length > 0;

    const Navigator = createSwitchNavigator(
      {
        Login: { screen: Login },
        // TODO: Drawer navigator
      },
      { initialRouteName: isLoggedIn ? 'Login' : 'Login' },
    );
    const Container = createAppContainer(Navigator);
    return (
      <ThemeProvider theme={theme}>
        <Screen>
          <Container />
        </Screen>
      </ThemeProvider>
    );
  }

  return null; // TODO: Loading screen
}

export default function App() {
  return (
    <Provider store={store}>
      <PersistGate persistor={persistor}>{renderApp}</PersistGate>
    </Provider>
  );
}
