import { Configuration, Client, IMetadata, IMetadataValue } from 'bugsnag-react-native';

import { store } from './store';
import { AppState, DatesState } from '../types/store';

function serializeState(state: AppState): IMetadata {
  const {
    day,
    dates,
    theme,
    user: { name, username, password, id, ...user },
    customDates,
    elearningPlans, // TODO: eh
  } = state;

  const dateTypes = Object.keys(dates) as Array<keyof DatesState>;
  const serializedDates = dateTypes.reduce((serialized: { [type in keyof DatesState]?: string }, key) => {
    const value = dates[key];
    serialized[key] = value ? value.toString() : undefined;
    return serialized;
  }, {});

  const serializedCustomDates = customDates.map(
    ({ year, date, scheduleDay, wednesday }) => `${year}|${date}|${scheduleDay}|${wednesday}`,
  );

  return {
    type: 'state',
    // day consists of booleans and strings
    day: (day as unknown) as IMetadataValue,
    dates: serializedDates,
    theme: (theme as unknown) as IMetadataValue,
    user: (user as unknown) as IMetadataValue,
    customDates: { value: serializedCustomDates.join('\n') }, // hack
  };
}

const config = new Configuration();
config.codeBundleId = '3.0.1-b15';
config.notifyReleaseStages = ['production'];
config.registerBeforeSendCallback((report) => {
  const state = store.getState();
  const {
    user: { name, username },
  } = state;

  client.setUser('', name, `${username}@westside66.net`);
  report.metadata = serializeState(state);
});

const client = new Client(config);
export default client;
