import { applyMiddleware, createStore, Middleware } from 'redux';
import { persistStore, persistReducer, createTransform } from 'redux-persist';
import { PersistPartial } from 'redux-persist/es/persistReducer';
import AsyncStorage from '@react-native-community/async-storage';
import thunk, { ThunkDispatch } from 'redux-thunk';
import { createLogger } from 'redux-logger';

import {
  AppState, AppAction,
  UserState,
  DatesState, SerializedDatesState,
} from '../types/store';
import rootReducer from '../reducers/root';

// Do not persist the profile-photo, it will be manually rehydrated
const profilePhotoTransform = createTransform<UserState, UserState>(
  (inboundState) => ({
    ...inboundState,
    profilePhoto: '',
  }),
  (outboundState) => outboundState,
  { whitelist: ['user'] },
);

// Converts dates to ISO strings and vice-versa
const dateTransform = createTransform<DatesState, SerializedDatesState>(
  (inboundState) => {
    const dates = inboundState as DatesState;
    const mappedDates = (Object.keys(dates) as Array<keyof DatesState>).reduce((
      map: { [K in keyof DatesState]?: string | string[] | null },
      dateType: keyof DatesState,
    ) => {
      const dateOrDates = dates[dateType];
      if (dateOrDates === null) {
        map[dateType] = dateOrDates;
      } else {
        map[dateType] = Array.isArray(dateOrDates)
          ? dateOrDates.map((date) => date.toISOString())
          : dateOrDates.toISOString();
      }
      return map;
    }, {}) as SerializedDatesState;
    return mappedDates;
  },
  (outboundState) => {
    const dates = outboundState as SerializedDatesState;
    const mappedDates = (Object.keys(dates) as Array<keyof SerializedDatesState>).reduce((
      map: { [K in keyof DatesState]?: Date | Date[] | null },
      dateType: keyof DatesState,
    ) => {
      const dateOrDates = dates[dateType];
      if (dateOrDates === null) {
        map[dateType] = dateOrDates;
      } else {
        map[dateType] = Array.isArray(dateOrDates)
          ? dateOrDates.map((date) => new Date(date))
          : new Date(dateOrDates);
      }
      return map;
    }, {}) as DatesState;
    return mappedDates;
  },
  { whitelist: ['dates'] },
);

export default function initializeStore() {
  const persistConfig = {
    key: 'root',
    version: 3,
    storage: AsyncStorage,
    transforms: [profilePhotoTransform, dateTransform],
  };
  const persistedReducer = persistReducer<AppState, AppAction>(persistConfig, rootReducer);

  const middleware: Middleware[] = [thunk];
  if (process.env.NODE_ENV === 'development') {
    middleware.push(createLogger());
  }
  const store = createStore<
    AppState & PersistPartial,
    AppAction,
    { dispatch: ThunkDispatch<AppState, undefined, AppAction> },
    {}
  >(
    persistedReducer,
    applyMiddleware(...middleware),
  );
  const persistor = persistStore(store);
  return { store, persistor };
}
