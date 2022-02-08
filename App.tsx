import { NavigationContainer } from '@react-navigation/native';
import React from 'react';
import StackNavigation from './navigations/StackNavigation';
import { LogBox } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

LogBox.ignoreLogs([
    "[react-native-gesture-handler] Seems like you're using an old API with gesture components, check out new Gestures system!",
    'Non-serializable values were found in the navigation state.',
]);

export default () => {
    return (
        <SafeAreaProvider>
            <NavigationContainer>
                <StackNavigation />
            </NavigationContainer>
        </SafeAreaProvider>
    );
};
