import React, { useCallback } from 'react';
import { createSharedElementStackNavigator } from 'react-navigation-shared-element';
import WebtoonDetail from '../screens/WebtoonDetail';
import TabNavigation from './TabNavigation';

export type MainStackParamList = {
    Tab: undefined;
    KakaoWebtoonDetail: undefined;
    WebtoonDetail: {
        image: string;
        title: string;
        desc: string;
        index: number;
    };
};

const Stack = createSharedElementStackNavigator<MainStackParamList>();

export default () => {
    const sharedElements = useCallback(route => {
        const { image, index } = route.params;
        return [
            `${index}-${image}.image`,
            `${index}-${image}.left-cover`,
            `${index}-${image}.right-cover`,
        ];
    }, []);

    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                presentation: 'modal',
            }}>
            <Stack.Screen name="Tab" component={TabNavigation} />
            <Stack.Screen
                name="WebtoonDetail"
                component={WebtoonDetail}
                sharedElements={sharedElements}
                options={{
                    transitionSpec: {
                        open: {
                            animation: 'timing',
                            config: { duration: 150 },
                        },
                        close: {
                            animation: 'timing',
                            config: { duration: 150 },
                        },
                    },
                    cardStyleInterpolator: ({ current: { progress } }: any) => {
                        return {
                            cardStyle: {
                                opacity: progress,
                            },
                        };
                    },
                }}
            />
        </Stack.Navigator>
    );
};
