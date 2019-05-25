import { applyMiddleware, createStore, Middleware } from 'redux';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import thunk from 'redux-thunk';
import { createLogger } from 'redux-logger';

import { AppState, AppAction } from '../types/store';
import rootReducer from '../reducers/root';

export default function initializeStore() {
  const persistConfig = {
    key: 'root',
    storage,
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
