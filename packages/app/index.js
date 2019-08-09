import { AppRegistry } from 'react-native';

import App from './App';
import { name as appName } from './app.json';
import { notificationScheduler } from './src/utils/notifications';

AppRegistry.registerHeadlessTask(appName, notificationScheduler);
AppRegistry.registerComponent(appName, () => App);
