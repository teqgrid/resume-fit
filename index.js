/**
 * Native entry. iOS/Android look up "ResumeFit" (from app.json)
 * and render the App component.
 */

import 'react-native-gesture-handler'; // must be first
import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';

AppRegistry.registerComponent(appName, () => App);
