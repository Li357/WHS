import React, { Component } from 'react';
import { StatusBar } from 'react-native';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import {
  createSwitchNavigator, createAppContainer, createDrawerNavigator,
} from 'react-navigation';
import { ThemeProvider } from 'styled-components';

import Login from './src/screens/Login';
import Dashboard from './src/screens/Dashboard';
import Schedule from './src/screens/Schedule';
import Loading from './src/screens/Loading';
import Drawer from './src/components/drawer/Drawer';
import initializeStore from './src/utils/store';
import { fetchDates, fetchSchoolPicture } from './src/actions/async';
import { getProfilePhoto } from './src/utils/manage-photos';
import { setUserInfo, setDaySchedule, setUserSchedule } from './src/actions/creators';
import { getScheduleTypeOnDate } from './src/utils/query-schedule';
import { getFinalsSchedule, interpolateAssembly } from './src/utils/process-schedule';
import { insert } from './src/utils/object';
import { ScheduleItem } from './src/types/schedule';

const { store, persistor } = initializeStore();

interface AppComponentState {
  rehydrated: boolean;
}

export default class App extends Component<{}, AppComponentState> {
  public state = {
    rehydrated: false,
  };

  private rehydrateProfilePhoto = async () => {
    const { user: { username, schoolPicture } } = store.getState();
    const profilePhoto = await getProfilePhoto(username) || schoolPicture;
    store.dispatch(setUserInfo({ profilePhoto }));
  }

  private updateDayScheduleIfNeeded() {
    const { dates, day: { schedule: dayScheduleType }, user: { schedule } } = store.getState();
    const now = new Date();

    const newDayScheduleType = getScheduleTypeOnDate(now, dates);
    if (newDayScheduleType === dayScheduleType) {
      return;
    }
    store.dispatch(setDaySchedule(newDayScheduleType));

    const day = now.getDay();
    let revisedUserDaySchedule;
    switch (newDayScheduleType) {
      case 'ASSEMBLY':
        revisedUserDaySchedule = interpolateAssembly(schedule[day - 1], day);
        break;
      case 'FINALS':
        revisedUserDaySchedule = getFinalsSchedule(schedule[day - 1]);
        break;
      default:
        return;
    }
    const revisedUserSchedule = insert<ScheduleItem[]>(schedule, [revisedUserDaySchedule], day - 1);
    return store.dispatch(setUserSchedule(revisedUserSchedule));
  }

  private silentlyUpdateData = async () => {
    try {
      await store.dispatch(fetchSchoolPicture());
      await store.dispatch(fetchDates());
    // tslint:disable-next-line: no-empty
    } catch {}
  }

  private createNavigationContainer = (isLoggedIn: boolean) => {
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

  private handleRehydrate = async () => {
    const { user: { username, password } } = store.getState();
    const isLoggedIn = username.length > 0 && password.length > 0;

    if (isLoggedIn) {
      await this.silentlyUpdateData();
      await this.rehydrateProfilePhoto();
      await this.updateDayScheduleIfNeeded();
    }
    this.setState({ rehydrated: true });
  }

  private renderApp = () => {
    if (this.state.rehydrated) {
      const { user: { username, password }, theme } = store.getState();
      const isLoggedIn = username.length > 0 && password.length > 0;
      const AppContainer = this.createNavigationContainer(isLoggedIn);

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

  public render() {
    return (
      <Provider store={store}>
        <PersistGate persistor={persistor} onBeforeLift={this.handleRehydrate}>
          {this.renderApp()}
        </PersistGate>
      </Provider>
    );
  }
}
