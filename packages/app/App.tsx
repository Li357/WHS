import React, { StrictMode } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

import initializeStore from './src/utils/store';

const { store, persistor } = initializeStore();
export default function App() {
  return (
    <StrictMode>
      <Provider store={store}>
        <PersistGate
          persistor={persistor}
        >
          <View style={styles.container}>
            <Text>Hello World!</Text>
          </View>
        </PersistGate>
      </Provider>
    </StrictMode>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
