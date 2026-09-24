// Stack navigator: Home first, then Result after Analyze succeeds.

import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import ResultScreen from '../screens/ResultScreen';
import {RootStackParamList} from '../types';

export type {RootStackParamList};

// Generic stack so each screen name is type-checked against RootStackParamList.
const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => (
  <NavigationContainer>
    {/* headerShown: false — we draw our own Back + logo */}
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Result" component={ResultScreen} />
    </Stack.Navigator>
  </NavigationContainer>
);

export default AppNavigator;
