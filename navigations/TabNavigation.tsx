import { BottomTabBarProps, createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import {
    Text,
    TouchableWithoutFeedback,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import KakaoWebtoon from '../screens/KakaoWebtoon';
import Zoom from '../screens/Zoom';

type RootTabNavigationProp = {
    Zoom: undefined,
    KakaoWebtoon: undefined;
}

const Tab = createBottomTabNavigator<RootTabNavigationProp>();

export default () => {
    const { bottom } = useSafeAreaInsets();

    return (
        <View style={{
            flex: 1,
            paddingBottom: bottom,
        }}>
            <Tab.Navigator
                screenOptions={{ headerShown: false }}
                tabBar={({ state, descriptors, navigation }: BottomTabBarProps) => {
                    return (
                        <View style={{
                            height: 60,
                            flexDirection: 'row'
                        }}>
                            {state.routes.map((route, index) => {
                                const { options } = descriptors[route.key];
                                const label =
                                    options.tabBarLabel !== undefined
                                        ? options.tabBarLabel
                                        : options.title !== undefined
                                            ? options.title
                                            : route.name;

                                const isFocused = state.index === index;

                                const onPress = () => {
                                    const event = navigation.emit({
                                        type: 'tabPress',
                                        target: route.key,
                                        canPreventDefault: true,
                                    });

                                    if (!isFocused && !event.defaultPrevented) {
                                        // The `merge: true` option makes sure that the params inside the tab screen are preserved
                                        navigation.navigate(route.name, { merge: true });
                                    }
                                };

                                return (
                                    <TouchableWithoutFeedback onPress={onPress} key={route.name}>
                                        <View style={{
                                            height: 60,
                                            flex: 1,
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                        }}>
                                            <Text>{label}</Text>
                                        </View>
                                    </TouchableWithoutFeedback>
                                )
                            })}
                        </View>
                    )
                }}>
                <Tab.Screen name="Zoom" component={Zoom} />
                <Tab.Screen name="KakaoWebtoon" component={KakaoWebtoon} />
            </Tab.Navigator>
        </View>
    )
}