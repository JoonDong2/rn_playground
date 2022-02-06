import {
    BottomTabBarProps,
    createBottomTabNavigator,
} from '@react-navigation/bottom-tabs';
import React, { useCallback, useState } from 'react';
import {
    LayoutChangeEvent,
    TouchableWithoutFeedback,
    View,
} from 'react-native';
import {
    PanGestureHandler,
    PanGestureHandlerGestureEvent,
} from 'react-native-gesture-handler';
import Animated, {
    useAnimatedGestureHandler,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ZoomModal from '../components/ZoomModal';
import KakaoWebtoon from '../screens/KakaoWebtoon';
import Zoom from '../screens/Zoom';

export enum MODAL_STATUS {
    DISSAPEARED = 0,
    DISSAPEARING = 1,
    MINIFIED = 2,
    MINIFING = 3,
    MAGNIFING = 4,
    MAGNIFIED = 5,
}

type RootTabNavigationProp = {
    Zoom: undefined;
    KakaoWebtoon: undefined;
};

const TAB_BAR_HEIGHT = 60;

const Tab = createBottomTabNavigator<RootTabNavigationProp>();

let SWIPABLE_HEIGHT = 0;

export default () => {
    const { bottom } = useSafeAreaInsets();

    const [modalVisible, setModalVisible] = useState(false);

    const modalStatus = useSharedValue(MODAL_STATUS.DISSAPEARED);
    const modalProgress = useSharedValue<number>(0); // 0 ~ 1

    const tabBarStyle = useAnimatedStyle(() => {
        return {
            transform: [
                {
                    translateY:
                        modalStatus.value === MODAL_STATUS.MINIFING // eslint-disable-next-line prettier/prettier
                            ? (TAB_BAR_HEIGHT + bottom) * (1 - modalProgress.value)
                            : modalStatus.value === MODAL_STATUS.MAGNIFING
                            ? (TAB_BAR_HEIGHT + bottom) * modalProgress.value
                            : 0,
                },
            ],
            opacity:
                modalStatus.value === MODAL_STATUS.MINIFING
                    ? modalProgress.value
                    : modalStatus.value === MODAL_STATUS.MAGNIFING
                    ? 1 - modalProgress.value
                    : 1,
        };
    });

    const onModalGestureEvent = useAnimatedGestureHandler<
        PanGestureHandlerGestureEvent,
        {
            yStartPosition: number;
        }
    >({
        onStart: (event, ctx) => {},
        onActive: (event, ctx) => {
            if (!SWIPABLE_HEIGHT) return;
        },
        onEnd: (event, ctx) => {
            ctx.yStartPosition = 0;
            modalProgress.value = withTiming(
                0,
                {
                    duration: 200,
                },
                finished => {
                    if (!finished) return;
                    modalProgress.value = MODAL_STATUS.DISSAPEARED;
                },
            );
        },
    });

    const onLayout = useCallback(
        ({
            nativeEvent: {
                layout: { height },
            },
        }: LayoutChangeEvent) => {
            SWIPABLE_HEIGHT = height - 60 - bottom;
        },
        [bottom],
    );

    return (
        <View
            onLayout={onLayout}
            style={{
                flex: 1,
                paddingBottom: bottom,
                backgroundColor: '#ffffff',
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
                <Tab.Screen name="Zoom" component={Zoom} />
                <Tab.Screen name="KakaoWebtoon" component={KakaoWebtoon} />
            </Tab.Navigator>
            {modalVisible && (
                <PanGestureHandler onGestureEvent={onModalGestureEvent}>
                    <Animated.View>
                        <ZoomModal
                            modalStatus={modalStatus}
                            modalProgress={modalProgress}
                        />
                    </Animated.View>
                </PanGestureHandler>
            )}
        </View>
    );
};
