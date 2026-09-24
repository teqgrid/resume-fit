/**
 * @format
 */

jest.mock('react-native-gesture-handler', () => {
  const React = require('react');
  const {View} = require('react-native');
  return {
    GestureHandlerRootView: ({children}: {children: React.ReactNode}) =>
      React.createElement(View, {style: {flex: 1}}, children),
  };
});
jest.mock('../src/navigation', () => () => null);

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import App from '../App';

test('renders correctly', async () => {
  await ReactTestRenderer.act(() => {
    ReactTestRenderer.create(<App />);
  });
});
