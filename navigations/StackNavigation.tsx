import React from 'react';
import { createSharedElementStackNavigator } from 'react-navigation-shared-element';
import TabNavigation from './TabNavigation';

export type MainStackParamList = {
    Tab: undefined;
    KakaoWebtoonDetail: undefined;
};

const Stack = createSharedElementStackNavigator<MainStackParamList>();

export default () => {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                presentation: 'modal',
            }}>
            <Stack.Screen name="Tab" component={TabNavigation} />
        </Stack.Navigator>
    );
};
