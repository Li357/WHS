import { Configuration, Client, IMetadata, IMetadataValue } from 'bugsnag-react-native';

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
    serialized[key] = value ? value.toString() : undefined;
    return serialized;
  }, {});

  return {
    type: 'state',
    // day consists of booleans and strings
    day: day as unknown as IMetadataValue,
    dates: serializedDates,
    theme: theme as unknown as IMetadataValue,
    user: user as unknown as IMetadataValue,
  };
}

const config = new Configuration();
config.codeBundleId = '3.0-b3';
config.notifyReleaseStages = ['production'];
config.registerBeforeSendCallback((report) => {
  const state = store.getState();
  const { user: { name, username } } = state;

  client.setUser('', name, `${username}@westside66.net`);
  report.metadata = serializeState(state);
});

const client = new Client(config);
export default client;
