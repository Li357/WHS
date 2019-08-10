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
import { isAfter } from 'date-fns';

import Drawer from './src/components/drawer/Drawer';
import Login from './src/screens/Login';
import Dashboard from './src/screens/Dashboard';
import Schedule from './src/screens/Schedule';
import Loading from './src/screens/Loading';
import Themer from './src/components/common/Themer';
import { store, persistor } from './src/utils/store';
import { fetchDates, fetchSchoolPicture, fetchUserInfo } from './src/actions/async';
import { getProfilePhoto } from './src/utils/manage-photos';
import { setUserInfo, setDaySchedule, setRefreshed, setUserSchedule } from './src/actions/creators';
import { getScheduleTypeOnDate, isScheduleEmpty } from './src/utils/query-schedule';
import Settings from './src/screens/Settings';
import AddSchedule from './src/screens/AddSchedule';
import registerNotificationScheduler, { scheduleNotifications } from './src/utils/notifications';

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
    const { user: { username, schoolPicture } } = store.getState();
    const profilePhoto = await getProfilePhoto(username) || schoolPicture;
    store.dispatch(setUserInfo({ profilePhoto }));
  }

  private updateDayScheduleIfNeeded(newStatus: AppStateStatus = 'active') {
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
    const {
      user: { username, password, schedule },
      dates: { semesterOneStart, semesterTwoStart, semesterTwoEnd },
      day: { refreshedSemesterOne, refreshedSemesterTwo },
    } = store.getState();
    const now = new Date();

    if (semesterOneStart === null || semesterTwoStart === null || semesterTwoEnd === null) {
      return;
    }
    if (isAfter(now, semesterTwoEnd)) {
      await store.dispatch(fetchDates(now.getFullYear()));
      store.dispatch(setRefreshed([false, false]));
      return PushNotification.cancelAllLocalNotifications();
    }

    const shouldRefresh = (isAfter(now, semesterTwoStart) && !refreshedSemesterTwo)
      || (isAfter(now, semesterOneStart) && !refreshedSemesterOne);
    if (isScheduleEmpty(schedule) || shouldRefresh) {
      await store.dispatch(fetchUserInfo(username, password));
      await scheduleNotifications(true);
    }
    await registerNotificationScheduler();
  }

  private silentlyUpdateData = async () => {
    try {
      await store.dispatch(fetchSchoolPicture());
      await store.dispatch(fetchDates());
      await scheduleNotifications(true);

      store.dispatch(setUserSchedule([
        [
          {
            "sourceId": 10001000,
            "startMod": 0,
            "endMod": 1,
            "length": 1,
            "day": 1,
            "title": "Homeroom",
            "body": "Rm. 113 (Grossman)",
            "sourceType": "homeroom"
          },
          {
            "sourceId": 10102000,
            "startMod": 1,
            "endMod": 2,
            "length": 1,
            "day": 1,
            "title": "Band - Warrior ",
            "body": "Rm. 183 (Krueger)",
            "sourceType": "course"
          },
          {
            "sourceId": 10203000,
            "startMod": 2,
            "endMod": 3,
            "length": 1,
            "day": 1,
            "title": "English Language & Comp AP",
            "body": "Rm. 220 (Spisak)",
            "sourceType": "course"
          },
          {
            "sourceId": 10304000,
            "startMod": 3,
            "endMod": 4,
            "length": 1,
            "day": 1,
            "title": "Open Mod",
            "body": "",
            "sourceType": "open"
          },
          {
            "sourceId": 10406000,
            "startMod": 4,
            "endMod": 6,
            "length": 2,
            "day": 1,
            "title": "Psychology AP ",
            "body": "Rm. 208 (Seals)",
            "sourceType": "course"
          },
          {
            "sourceId": 10608000,
            "startMod": 6,
            "endMod": 8,
            "length": 2,
            "day": 1,
            "title": "Open Mod",
            "body": "",
            "sourceType": "open"
          },
          {
            "sourceId": 10810000,
            "startMod": 8,
            "endMod": 10,
            "length": 2,
            "day": 1,
            "title": "US History AP Sem 1",
            "body": "Rm. 210 (Bramley)",
            "sourceType": "course"
          },
          {
            "sourceId": 11012000,
            "startMod": 10,
            "endMod": 12,
            "length": 2,
            "day": 1,
            "title": "Open Mod",
            "body": "",
            "sourceType": "open"
          },
          {
            "sourceId": 11213000,
            "startMod": 12,
            "endMod": 13,
            "length": 1,
            "day": 1,
            "title": "S&C2 - Strength & Conditioning 2",
            "body": "Rm. 150 (Secora)",
            "sourceType": "course"
          },
          {
            "sourceId": 11314000,
            "startMod": 13,
            "endMod": 14,
            "length": 1,
            "day": 1,
            "title": "Physics AP C",
            "body": "Rm. 325 (Stucky)",
            "sourceType": "course"
          },
          {
            "sourceId": 11415000,
            "startMod": 14,
            "endMod": 15,
            "length": 1,
            "day": 1,
            "title": "Latin 3",
            "body": "Rm. 146 (Harvey)",
            "sourceType": "course"
          }
        ],
        [
          {
            "sourceId": 20001000,
            "startMod": 0,
            "endMod": 1,
            "length": 1,
            "day": 2,
            "title": "Homeroom",
            "body": "Rm. 113 (Grossman)",
            "sourceType": "homeroom"
          },
          {
            "sourceId": 20103000,
            "startMod": 1,
            "endMod": 2,
            "length": 1,
            "day": 2,
            "title": "English Language & Comp AP",
            "body": "Rm. 136 (Spisak)",
            "sourceType": "course"
          },
          {
            "sourceId": 9999999,
            "startMod": 2,
            "endMod": 4,
            "length": 2,
            "day": 2,
            "columns": [
              [
                {
                  "sourceId": 21012000,
                  "startMod": 2,
                  "endMod": 3,
                  "length": 1,
                  "day": 2,
                  "title": "Psychology AP ",
                  "body": "Rm. 220 (Seals)",
                  "sourceType": "course"
                }
              ],
              [
                {
                  "sourceId": 21012000,
                  "startMod": 2,
                  "endMod": 4,
                  "length": 2,
                  "day": 2,
                  "title": "Miss Psychology AP",
                  "body": "Rm 220",
                  "sourceType": "annotation"
                }
              ],
              [
                {
                  "sourceId": 21013000,
                  "startMod": 3,
                  "endMod": 4,
                  "length": 1,
                  "day": 2,
                  "title": "Chemistry AP",
                  "body": "Rm. 321 (Gradoville)",
                  "sourceType": "course"
                }
              ]
            ]
          },
          {
            "sourceId": 20306000,
            "startMod": 4,
            "endMod": 6,
            "length": 2,
            "day": 2,
            "title": "Physics AP C",
            "body": "Rm. 325 (Stucky)",
            "sourceType": "course"
          },
          {
            "sourceId": 20608000,
            "startMod": 6,
            "endMod": 8,
            "length": 2,
            "day": 2,
            "title": "S&C2 - Strength & Conditioning 2",
            "body": "Rm. 150 (Secora)",
            "sourceType": "course"
          },
          {
            "sourceId": 20810000,
            "startMod": 8,
            "endMod": 10,
            "length": 2,
            "day": 2,
            "title": "Latin 3",
            "body": "Rm. 146 (Harvey)",
            "sourceType": "course"
          },
          {
            "sourceId": 21013000,
            "startMod": 10,
            "endMod": 13,
            "length": 3,
            "day": 2,
            "columns": [
              [
                {
                  "sourceId": 21012000,
                  "startMod": 10,
                  "endMod": 12,
                  "length": 2,
                  "day": 2,
                  "title": "Psychology AP ",
                  "body": "Rm. 220 (Seals)",
                  "sourceType": "course"
                }
              ],
              [
                {
                  "sourceId": 21012000,
                  "startMod": 10,
                  "endMod": 12,
                  "length": 2,
                  "day": 2,
                  "title": "Miss Psychology AP",
                  "body": "Rm 220",
                  "sourceType": "annotation"
                }
              ],
              [
                {
                  "sourceId": 21013000,
                  "startMod": 10,
                  "endMod": 13,
                  "length": 3,
                  "day": 2,
                  "title": "Chemistry AP",
                  "body": "Rm. 321 (Gradoville)",
                  "sourceType": "course"
                }
              ]
            ]
          },
          {
            "sourceId": 21314000,
            "startMod": 13,
            "endMod": 14,
            "length": 1,
            "day": 2,
            "title": "Open Mod",
            "body": "",
            "sourceType": "open"
          },
          {
            "sourceId": 21415000,
            "startMod": 14,
            "endMod": 15,
            "length": 1,
            "day": 2,
            "title": "Band - Concert Jazz ",
            "body": "Rm. 184 (Krueger)",
            "sourceType": "course"
          }
        ],
        [
          {
            "sourceId": 30001000,
            "startMod": 0,
            "endMod": 1,
            "length": 1,
            "day": 3,
            "title": "No Homeroom",
            "body": "Classes shift 20 minutes earlier",
            "sourceType": "annotation"
          },
          {
            "sourceId": 30102000,
            "startMod": 1,
            "endMod": 2,
            "length": 1,
            "day": 3,
            "title": "Band - Warrior ",
            "body": "Rm. 183 (Krueger)",
            "sourceType": "course"
          },
          {
            "sourceId": 30203000,
            "startMod": 2,
            "endMod": 3,
            "length": 1,
            "day": 3,
            "title": "Psychology AP ",
            "body": "Rm. 208 (Seals)",
            "sourceType": "course"
          },
          {
            "sourceId": 30305000,
            "startMod": 3,
            "endMod": 5,
            "length": 2,
            "day": 3,
            "title": "US History AP Sem 1",
            "body": "Rm. 220 (Brousek)",
            "sourceType": "course"
          },
          {
            "sourceId": 30506000,
            "startMod": 5,
            "endMod": 6,
            "length": 1,
            "day": 3,
            "title": "Open Mod",
            "body": "",
            "sourceType": "open"
          },
          {
            "sourceId": 30608000,
            "startMod": 6,
            "endMod": 8,
            "length": 2,
            "day": 3,
            "title": "Band - Concert Jazz ",
            "body": "Rm. 184 (Krueger)",
            "sourceType": "course"
          },
          {
            "sourceId": 30810000,
            "startMod": 8,
            "endMod": 10,
            "length": 2,
            "day": 3,
            "title": "S&C2 - Strength & Conditioning 2",
            "body": "Rm. 150 (Secora)",
            "sourceType": "course"
          },
          {
            "sourceId": 31012000,
            "startMod": 10,
            "endMod": 12,
            "length": 2,
            "day": 3,
            "title": "Physics AP C",
            "body": "Rm. 325 (Stucky)",
            "sourceType": "course"
          },
          {
            "sourceId": 31213000,
            "startMod": 12,
            "endMod": 13,
            "length": 1,
            "day": 3,
            "title": "Open Mod",
            "body": "",
            "sourceType": "open"
          },
          {
            "sourceId": 31314000,
            "startMod": 13,
            "endMod": 14,
            "length": 1,
            "day": 3,
            "title": "Latin 3",
            "body": "Rm. 146 (Harvey)",
            "sourceType": "course"
          },
          {
            "sourceId": 31415000,
            "startMod": 14,
            "endMod": 15,
            "length": 1,
            "day": 3,
            "title": "Chemistry AP",
            "body": "Rm. 321 (Gradoville)",
            "sourceType": "course"
          }
        ],
        [
          {
            "sourceId": 40001000,
            "startMod": 0,
            "endMod": 1,
            "length": 1,
            "day": 4,
            "title": "Homeroom",
            "body": "Rm. 113 (Grossman)",
            "sourceType": "homeroom"
          },
          {
            "sourceId": 40102000,
            "startMod": 1,
            "endMod": 2,
            "length": 1,
            "day": 4,
            "title": "Band - Warrior ",
            "body": "Rm. 183 (Krueger)",
            "sourceType": "course"
          },
          {
            "sourceId": 40203000,
            "startMod": 2,
            "endMod": 3,
            "length": 1,
            "day": 4,
            "title": "Latin 3",
            "body": "Rm. 146 (Harvey)",
            "sourceType": "course"
          },
          {
            "sourceId": 40306000,
            "startMod": 3,
            "endMod": 6,
            "length": 3,
            "day": 4,
            "title": "Chemistry AP",
            "body": "Rm. 321 (Gradoville)",
            "sourceType": "course"
          },
          {
            "sourceId": 40608000,
            "startMod": 6,
            "endMod": 8,
            "length": 2,
            "day": 4,
            "title": "US History AP Sem 1",
            "body": "Rm. 210 (Bramley)",
            "sourceType": "course"
          },
          {
            "sourceId": 40810000,
            "startMod": 8,
            "endMod": 10,
            "length": 2,
            "day": 4,
            "title": "English Language & Comp AP",
            "body": "Rm. 136 (Spisak)",
            "sourceType": "course"
          },
          {
            "sourceId": 41012000,
            "startMod": 10,
            "endMod": 12,
            "length": 2,
            "day": 4,
            "title": "S&C2 - Strength & Conditioning 2",
            "body": "Rm. 150 (Secora)",
            "sourceType": "course"
          },
          {
            "sourceId": 41213000,
            "startMod": 12,
            "endMod": 13,
            "length": 1,
            "day": 4,
            "title": "Open Mod",
            "body": "",
            "sourceType": "open"
          },
          {
            "sourceId": 41314000,
            "startMod": 13,
            "endMod": 14,
            "length": 1,
            "day": 4,
            "title": "Band - Concert Jazz ",
            "body": "Rm. 184 (Krueger)",
            "sourceType": "course"
          },
          {
            "sourceId": 41415000,
            "startMod": 14,
            "endMod": 15,
            "length": 1,
            "day": 4,
            "title": "Physics AP C",
            "body": "Rm. 325 (Stucky)",
            "sourceType": "course"
          }
        ],
        [
          {
            "sourceId": 50001000,
            "startMod": 0,
            "endMod": 1,
            "length": 1,
            "day": 5,
            "title": "Homeroom",
            "body": "Rm. 113 (Grossman)",
            "sourceType": "homeroom"
          },
          {
            "sourceId": 50102000,
            "startMod": 1,
            "endMod": 2,
            "length": 1,
            "day": 5,
            "title": "Band - Warrior ",
            "body": "Rm. 183 (Krueger)",
            "sourceType": "course"
          },
          {
            "sourceId": 50203000,
            "startMod": 2,
            "endMod": 4,
            "length": 2,
            "day": 5,
            "title": "US Hist AP Cross Section",
            "body": "Rm 210",
            "sourceType": "annotation"
          },
          {
            "sourceId": 50406000,
            "startMod": 4,
            "endMod": 6,
            "length": 2,
            "day": 5,
            "columns": [
              [
                {
                  "sourceId": 50406000,
                  "startMod": 4,
                  "endMod": 6,
                  "length": 2,
                  "day": 5,
                  "title": "Chemistry AP",
                  "body": "Rm. 321 (Gradoville)",
                  "sourceType": "course"
                }
              ],
              [
                {
                  "sourceId": 50406000,
                  "startMod": 4,
                  "endMod": 6,
                  "length": 2,
                  "day": 5,
                  "title": "Jr Guidance",
                  "body": "Rm. 220 (Cunningham)",
                  "sourceType": "course"
                }
              ]
            ]
          },
          {
            "sourceId": 50608000,
            "startMod": 6,
            "endMod": 8,
            "length": 2,
            "day": 5,
            "title": "Open Mod",
            "body": "",
            "sourceType": "open"
          },
          {
            "sourceId": 50810000,
            "startMod": 8,
            "endMod": 10,
            "length": 2,
            "day": 5,
            "title": "S&C2 - Strength & Conditioning 2",
            "body": "Rm. 150 (Secora)",
            "sourceType": "course"
          },
          {
            "sourceId": 51012000,
            "startMod": 10,
            "endMod": 12,
            "length": 2,
            "day": 5,
            "title": "Psychology AP ",
            "body": "Rm. 208 (Seals)",
            "sourceType": "course"
          },
          {
            "sourceId": 51213000,
            "startMod": 12,
            "endMod": 13,
            "length": 1,
            "day": 5,
            "title": "Latin 3",
            "body": "Rm. 146 (Harvey)",
            "sourceType": "course"
          },
          {
            "sourceId": 51314000,
            "startMod": 13,
            "endMod": 14,
            "length": 1,
            "day": 5,
            "columns": [
              [
                {
                  "sourceId": 51314000,
                  "startMod": 13,
                  "endMod": 14,
                  "length": 1,
                  "day": 5,
                  "title": "Physics AP C",
                  "body": "Rm. 325 (Stucky)",
                  "sourceType": "course"
                }
              ],
              [
                {
                  "sourceId": 51314000,
                  "startMod": 13,
                  "endMod": 14,
                  "length": 1,
                  "day": 5,
                  "title": "US History AP Sem 1",
                  "body": "Rm. 210 (Bramley)",
                  "sourceType": "course"
                }
              ],
              [
                {
                  "sourceId": 51314000,
                  "startMod": 13,
                  "endMod": 14,
                  "length": 1,
                  "day": 5,
                  "title": "Miss US History AP",
                  "body": "Rm 210",
                  "sourceType": "annotation"
                }
              ]
            ]
          },
          {
            "sourceId": 51415000,
            "startMod": 14,
            "endMod": 15,
            "length": 1,
            "day": 5,
            "title": "Open Mod",
            "body": "",
            "sourceType": "open"
          }
        ]
      ]));
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
    const { user: { username, password } } = store.getState();
    const isLoggedIn = username.length > 0 && password.length > 0;

    if (isLoggedIn) {
      await this.silentlyUpdateData();
      await this.rehydrateProfilePhoto();
      await this.refreshScheduleIfNeeded();
      this.updateDayScheduleIfNeeded();
    }
    this.setState({ rehydrated: true });
  }

  private renderApp = () => {
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
