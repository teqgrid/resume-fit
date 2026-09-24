// App root. Registers wrappers every screen sits inside.
// index.js then registers this component with AppRegistry.

import 'react-native-gesture-handler'; // must load before other RN imports
import React from 'react';
import {StatusBar, StyleSheet} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import AppNavigator from './src/navigation';

function App() {
  return (
    <GestureHandlerRootView style={styles.root}>
      {/* Lets useSafeAreaInsets() work on Home and Result */}
      <SafeAreaProvider>
        <StatusBar barStyle="dark-content" />
        <AppNavigator />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});

export default App;
