import { NavigationContainer } from '@react-navigation/native';
import React from 'react';
import StackNavigation from './navigations/StackNavigation';
import { LogBox } from 'react-native';

LogBox.ignoreLogs([
    "[react-native-gesture-handler] Seems like you\'re using an old API with gesture components, check out new Gestures system!",
]);

export default () => {
    return (
        <NavigationContainer>
            <StackNavigation />
        </NavigationContainer>
    )
}