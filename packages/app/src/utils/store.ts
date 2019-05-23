import { applyMiddleware, createStore, Middleware } from 'redux';
import { persistStore, persistCombineReducers } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import thunk from 'redux-thunk';
import { createLogger } from 'redux-logger';

import userReducer from '../reducers/user';
import dayReducer from '../reducers/day';
import { StoreAndPersistor, AppState } from '../types/store';

export default function initializeStore(): StoreAndPersistor {
  const persistConfig = {
    key: 'root',
    storage,
  };
  const persistedReducer = persistCombineReducers<AppState>(persistConfig, {
    user: userReducer,
    day: dayReducer,
  });

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
