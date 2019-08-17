import React, { Component } from 'react';
import { AppState as RNAppState, AppStateStatus } from 'react-native';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { createAppContainer, createDrawerNavigator } from 'react-navigation';
import { Transition } from 'react-native-reanimated';
import createAnimatedSwitchNavigator from 'react-navigation-animated-switch';
import codePush from 'react-native-code-push';
import PushNotification from 'react-native-push-notification';
// https://github.com/kmagiera/react-native-gesture-handler/issues/320
import 'react-native-gesture-handler';
import { isAfter, isBefore, subDays } from 'date-fns';

import Drawer from './src/components/drawer/Drawer';
import Login from './src/screens/Login';
import Dashboard from './src/screens/Dashboard';
import Schedule from './src/screens/Schedule';
import Loading from './src/screens/Loading';
import Themer from './src/components/common/Themer';
import { store, persistor } from './src/utils/store';
import { fetchDates, fetchSchoolPicture, fetchUserInfo } from './src/actions/async';
import { getProfilePhoto } from './src/utils/manage-photos';
import { setUserInfo, setDaySchedule, setRefreshed } from './src/actions/creators';
import { getScheduleTypeOnDate, isScheduleEmpty } from './src/utils/query-schedule';
import Settings from './src/screens/Settings';
import AddSchedule from './src/screens/AddSchedule';
import registerNotificationScheduler, { scheduleNotifications } from './src/utils/notifications';
import { reportScheduleCaution, notify } from './src/utils/utils';
import client from './src/utils/bugsnag';
import { LoginError } from './src/utils/error';
import { LOGIN_CREDENTIALS_CHANGED_MSG } from './src/constants/fetch';

interface AppComponentState {
  rehydrated: boolean;
}

@codePush({
  checkFrequency: codePush.CheckFrequency.ON_APP_RESUME,
  installMode: codePush.InstallMode.ON_NEXT_RESUME,
  mandatoryInstallMode: codePush.InstallMode.ON_NEXT_RESUME,
})
export default class App extends Component<{}, AppComponentState> {
  public state = {
    rehydrated: false,
  };

  private rehydrateProfilePhoto = async () => {
    client.leaveBreadcrumb('Rehydrating profile photo');

    const { user: { username, schoolPicture } } = store.getState();
    const profilePhoto = await getProfilePhoto(username) || schoolPicture;
    store.dispatch(setUserInfo({ profilePhoto }));
  }

  private updateDayScheduleIfNeeded(newStatus: AppStateStatus = 'active') {
    client.leaveBreadcrumb('Updating today\'s schedule if needed');

    if (newStatus === 'active') {
      const { dates, day: { schedule: dayScheduleType } } = store.getState();
      const now = new Date();

      const newDayScheduleType = getScheduleTypeOnDate(now, dates);
      if (newDayScheduleType === dayScheduleType) {
        return;
      }
      store.dispatch(setDaySchedule(newDayScheduleType));
    }
  }

  private async refreshScheduleIfNeeded() {
    client.leaveBreadcrumb('Refreshing schedule and notifications if needed');

    const {
      user: { username, password, schedule },
      dates: { semesterOneStart, semesterTwoStart, semesterTwoEnd },
      day: { refreshedSemesterOne, refreshedSemesterTwo },
    } = store.getState();
    const now = new Date();

    try {
      if (semesterOneStart === null || semesterTwoStart === null || semesterTwoEnd === null) {
        return;
      }
      if (isAfter(now, semesterTwoEnd)) {
        client.leaveBreadcrumb('Refreshing dates after end of year');

        await store.dispatch(fetchDates(now.getFullYear()));
        store.dispatch(setRefreshed([false, false]));
        return PushNotification.cancelAllLocalNotifications();
      }

      const shouldRefresh = (isAfter(now, semesterTwoStart) && !refreshedSemesterTwo)
        || (isAfter(now, semesterOneStart) && !refreshedSemesterOne);
      if (isScheduleEmpty(schedule) || shouldRefresh) {
        client.leaveBreadcrumb('Refreshing semesters one/two');

        await store.dispatch(fetchUserInfo(username, password));
        await scheduleNotifications();
      }
      await registerNotificationScheduler();
    } catch (error) {
      if (error instanceof LoginError) {
        return notify('Error', LOGIN_CREDENTIALS_CHANGED_MSG);
      }
      // rethrow to handle in handleRehydrate
      throw error;
    }
  }

  private silentlyUpdateData = async () => {
    client.leaveBreadcrumb('Updating dates, school picture, and notifications');

    try {
      await store.dispatch(fetchSchoolPicture());
      await store.dispatch(fetchDates());
      await scheduleNotifications();
    } catch {
      client.leaveBreadcrumb('Update failed silently');
    }
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
      AddSchedule: {
        screen: AddSchedule,
        navigationOptions: {
          drawerIcon: 'add',
          drawerLabel: 'Add Schedule',
        },
      },
      Settings: {
        screen: Settings,
        navigationOptions: {
          drawerIcon: 'settings',
        },
      },
    }, {
      initialRouteName: 'Dashboard',
      contentComponent: Drawer,
    });
    const Navigator = createAnimatedSwitchNavigator({
      Login: { screen: Login },
      Authorized: { screen: Authorized },
    }, {
      initialRouteName: isLoggedIn ? 'Authorized' : 'Login',
      transition: (
        <Transition.Together>
          <Transition.In type="slide-top" durationMs={400} interpolation="easeInOut" />
          <Transition.Out type="slide-bottom" durationMs={200} interpolation="easeInOut" />
        </Transition.Together>
      ),
    });
    return createAppContainer(Navigator);
  }

  private handleRehydrate = async () => {
    client.leaveBreadcrumb('Rehydrated!');

    try {
      const { user: { username, password } } = store.getState();
      const isLoggedIn = username.length > 0 && password.length > 0;

      if (isLoggedIn) {
        await this.silentlyUpdateData();
        await this.rehydrateProfilePhoto();
        await this.refreshScheduleIfNeeded();
        this.updateDayScheduleIfNeeded();

        const { dates: { semesterOneStart } } = store.getState();
        if (semesterOneStart !== null) {
          const freshmenDay = subDays(semesterOneStart, 1);
          if (isBefore(new Date(), freshmenDay)) {
            client.leaveBreadcrumb('Reporting schedule caution');
            reportScheduleCaution(semesterOneStart);
          }
        }
      }
      this.setState({ rehydrated: true });
    } catch (error) {
      notify('Error', 'Something went wrong, please try restarting the app.');
      client.notify(error);
    }
  }

  private renderApp = () => {
    client.leaveBreadcrumb('Rendering navigation container');

    const { user: { username, password } } = store.getState();
    const isLoggedIn = username.length > 0 && password.length > 0;
    const AppContainer = this.createNavigationContainer(isLoggedIn);
    return (<Themer><AppContainer /></Themer>);
  }

  public componentDidMount() {
    RNAppState.addEventListener('change', this.updateDayScheduleIfNeeded);
  }

  public componentWillUnmount() {
    RNAppState.removeEventListener('change', this.updateDayScheduleIfNeeded);
  }

  public render() {
    return (
      <Provider store={store}>
        <PersistGate
          loading={<Loading />}
          persistor={persistor}
          onBeforeLift={this.handleRehydrate}
        >
          {this.renderApp()}
        </PersistGate>
      </Provider>
    );
  }
}
