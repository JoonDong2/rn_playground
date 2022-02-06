import { NavigationContainer } from '@react-navigation/native';
import React from 'react';
import StackNavigation from './StackNavigation';

export default () => {
    return (
        <NavigationContainer>
            <StackNavigation />
        </NavigationContainer>
    )
}