import { applyMiddleware, createStore, Middleware } from 'redux';
import { persistStore, persistReducer, createTransform } from 'redux-persist';
import AsyncStorage from '@react-native-community/async-storage';
import thunk from 'redux-thunk';
import { createLogger } from 'redux-logger';

import { AppState, AppAction, UserState, DayState, SerializedDayState } from '../types/store';
import rootReducer from '../reducers/root';

// Do not persist the profile-photo, it will be manually rehydrated
const profilePhotoTransform = createTransform<UserState, UserState>(
  (inboundState) => inboundState,
  (outboundState) => ({
    ...outboundState,
    profilePhoto: '',
  }),
  { whitelist: ['user'] },
);

const dateTransform = createTransform<SerializedDayState, DayState>(
  ({ lastStateUpdate, ...rest }) => ({
    ...rest,
    lastStateUpdate: lastStateUpdate !== null ? new Date(lastStateUpdate) : null,
  }),
  ({ lastStateUpdate, ...rest }) => ({
    ...rest,
    lastStateUpdate: lastStateUpdate !== null ? lastStateUpdate.toUTCString() : null,
  }),
  { whitelist: ['day'] },
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
  const store = createStore(
    persistedReducer,
    applyMiddleware(...middleware),
  );
  const persistor = persistStore(store);
  return { store, persistor };
}
