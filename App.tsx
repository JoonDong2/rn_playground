import { NavigationContainer } from '@react-navigation/native';
import React from 'react';
import {
    View,
} from 'react-native';
import StackNavigation from './navigations/StackNavigation';

export default () => {
    return (
        <NavigationContainer>
            <StackNavigation />
        </NavigationContainer>
    )
}