import {
    BottomTabBarProps,
    createBottomTabNavigator,
} from '@react-navigation/bottom-tabs';
import React, { useCallback, useEffect, useState } from 'react';
import { TouchableWithoutFeedback, View } from 'react-native';
import {
    PanGestureHandler,
    PanGestureHandlerGestureEvent,
} from 'react-native-gesture-handler';
import Animated, {
    Easing,
    useAnimatedGestureHandler,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { screen, window } from '../Constants';
import KakaoWebtoon from '../screens/KakaoWebtoon';
import Zoom from '../screens/Zoom';

export type RootTabNavigationProp = {
    Zoom: {
        openModal: () => void;
        closeModal: () => void;
    };
    KakaoWebtoon: undefined;
};

const TAB_BAR_HEIGHT = 60;
const MINIFIED_MODAL_HEIGHT = 60;

let modalMinifiedTop = 0;

const Tab = createBottomTabNavigator<RootTabNavigationProp>();

export default () => {
    const { top, bottom } = useSafeAreaInsets();
    const [modalVisible, setModalVisible] = useState(false);

    // screen.height: 사라진 상태 (modalVisible: false)
    // modalMinifiedTop: 최소화 상태
    // top: 풀스크린 상태
    const modalTop = useSharedValue<number>(screen.height);

    const [modalMaxHeight, setModalMaxHeight] = useState(0);

    useEffect(() => {
        setModalMaxHeight(window.height - top);
        modalMinifiedTop =
            window.height - bottom - TAB_BAR_HEIGHT - MINIFIED_MODAL_HEIGHT;
    }, [top, bottom]);

    const tabBarStyle = useAnimatedStyle(() => {
        return {
            transform: [
                {
                    translateY: 0,
                },
            ],
            opacity: 1,
        };
    });

    const modalStyle = useAnimatedStyle(() => {
        return {
            height: 100,
            top: modalTop.value,
        };
    });

    const onModalGestureEvent = useAnimatedGestureHandler<
        PanGestureHandlerGestureEvent,
        {
            firstModalTop: number;
            minY: number;
            maxY: number;
            animating: boolean;
        }
    >({
        onStart: (event, ctx) => {
            if (ctx.animating) return;
            ctx.animating = true;
            ctx.firstModalTop = modalTop.value;
        },
        onActive: (event, ctx) => {
            // console.log("여기2", ctx.firstModalTop, translateY);
            modalTop.value = ctx.firstModalTop + event.translationY;
        },
        onEnd: (event, ctx) => {
            ctx.animating = false;
        },
    });

    const openModal = useCallback(() => {
        modalTop.value = withTiming(top, {
            duration: 500,
            easing: Easing.out(Easing.exp),
        });
    }, [modalTop, top]);

    const closeModal = useCallback(() => {}, []);

    return (
        <View
            style={{
                flex: 1,
                backgroundColor: '#ffffff',
                paddingBottom: bottom,
            }}>
            <Tab.Navigator
                screenOptions={{ headerShown: false }}
                tabBar={({
                    state,
                    descriptors,
                    navigation,
                }: BottomTabBarProps) => {
                    return (
                        <Animated.View
                            style={[
                                tabBarStyle,
                                {
                                    height: TAB_BAR_HEIGHT,
                                    flexDirection: 'row',
                                    borderTopColor: '#000000',
                                    borderTopWidth: 0.5,
                                },
                            ]}>
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
                                        navigation.navigate(route.name, {
                                            merge: true,
                                        });
                                    }
                                };

                                return (
                                    <TouchableWithoutFeedback
                                        onPress={onPress}
                                        key={route.name}>
                                        <Animated.View
                                            style={{
                                                height: TAB_BAR_HEIGHT,
                                                flex: 1,
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                            }}>
                                            <Animated.Text
                                                style={{
                                                    fontWeight: isFocused
                                                        ? 'bold'
                                                        : 'normal',
                                                }}>
                                                {label}
                                            </Animated.Text>
                                        </Animated.View>
                                    </TouchableWithoutFeedback>
                                );
                            })}
                        </Animated.View>
                    );
                }}>
                <Tab.Screen
                    name="Zoom"
                    component={Zoom}
                    initialParams={{
                        openModal,
                        closeModal,
                    }}
                />
                <Tab.Screen name="KakaoWebtoon" component={KakaoWebtoon} />
            </Tab.Navigator>
            <PanGestureHandler onGestureEvent={onModalGestureEvent}>
                <Animated.View
                    style={[
                        modalStyle,
                        {
                            position: 'absolute',
                            width: window.width,
                            backgroundColor: 'red',
                            height: 60,
                        },
                    ]}></Animated.View>
            </PanGestureHandler>
        </View>
    );
};
