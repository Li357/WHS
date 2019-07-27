import { Configuration, Client, IMetadata } from 'bugsnag-react-native';

import { store } from './store';
import { AppState, DatesState } from '../types/store';

function serializeState(state: AppState): IMetadata {
  const {
    day,
    dates,
    theme,
    user: { name, username, password, id, ...user },
  } = state;

  const dateTypes = Object.keys(dates) as Array<keyof DatesState>;
  const serializedDates = dateTypes.reduce((serialized: { [type in keyof DatesState]?: string }, key) => {
    const value = dates[key];
    if (value instanceof Date) {
      serialized[key] = value.toString();
    } else if (Array.isArray(value)) {
      serialized[key] = value.map((date) => date.toString()).join(', ');
    } else {
      serialized[key] = undefined;
    }
    return serialized;
  }, {});

  return {
    type: 'state',
    day: JSON.stringify(day),
    dates: serializedDates,
    theme: JSON.stringify(theme),
    user: JSON.stringify(user),
  };
}

const config = new Configuration();
config.codeBundleId = '3.0-b1';
config.notifyReleaseStages = ['production'];
config.registerBeforeSendCallback((report) => {
  const state = store.getState();
  const { user: { name, username } } = state;

  client.setUser('', name, `${username}@westside66.net`);
  report.metadata = serializeState(state);
});

const client = new Client(config);
export default client;
