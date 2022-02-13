import {
    BottomTabNavigationProp,
    createBottomTabNavigator,
} from '@react-navigation/bottom-tabs';
import { CompositeNavigationProp, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useCallback, useState } from 'react';
import { Alert, TouchableWithoutFeedback, View } from 'react-native';
import {
    PanGestureHandler,
    PanGestureHandlerGestureEvent,
} from 'react-native-gesture-handler';
import Animated, {
    runOnJS,
    useAnimatedGestureHandler,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { screen, window } from '../Constants';
import KakaoWebtoon from '../screens/KakaoWebtoon';
import Zoom from '../screens/Zoom';
import { MainStackParamList } from './StackNavigation';
import { Socket } from 'socket.io-client';
import ZoomModal from '../components/ZoomModal';

export type RootTabNavigationProp = {
    Zoom: {
        openChatModal: (props: {
            socket: Socket;
            roomName: string;
            type: 'owner' | 'visitor';
        }) => void;
        closeChatModal: (local?: boolean) => void;
    };
    KakaoWebtoon: undefined;
};

const TAB_BAR_HEIGHT = 60;
const MINIFIED_MODAL_HEIGHT = 60;

let modalMaxHeight = 0;
let modalMinifiedTop = 0;

const tabs: {
    name: 'Zoom' | 'KakaoWebtoon';
    label: string;
}[] = [
    {
        name: 'Zoom',
        label: 'Zoom 클론',
    },
    {
        name: 'KakaoWebtoon',
        label: '카카오웹툰 클론',
    },
];

const Tab = createBottomTabNavigator<RootTabNavigationProp>();

type TabRouteProp = RouteProp<MainStackParamList, 'Tab'>;

type TabNavigationProp = CompositeNavigationProp<
    StackNavigationProp<MainStackParamList, 'Tab'>,
    BottomTabNavigationProp<RootTabNavigationProp, 'Zoom'>
>;

type TabProps = {
    route: TabRouteProp;
    navigation: TabNavigationProp;
};

export default ({ navigation }: TabProps) => {
    const [roomInfo, setRoomInfo] = useState<
        | {
              socket: Socket;
              roomName: string;
              type: 'owner' | 'visitor';
          }
        | undefined
    >(undefined);

    const [currentIndex, setCurrentIndex] = useState(0);

    const { top, bottom } = useSafeAreaInsets();
    const [modalVisible, setModalVisible] = useState(false);

    modalMaxHeight = window.height - top;
    modalMinifiedTop =
        window.height - bottom - TAB_BAR_HEIGHT - MINIFIED_MODAL_HEIGHT;

    // screen.height: 사라진 상태 (modalVisible: false)
    // modalMinifiedTop: 최소화 상태
    // top: 풀스크린 상태
    const modalTop = useSharedValue<number>(screen.height);
    const modalHeight = useSharedValue<number>(modalMaxHeight);

    const tabBarStyle = useAnimatedStyle(() => {
        return {
            transform: [
                {
                    translateY:
                        (MINIFIED_MODAL_HEIGHT + TAB_BAR_HEIGHT + bottom) *
                        Math.max(
                            (modalMinifiedTop - modalTop.value) /
                                (modalMinifiedTop - top),
                            0,
                        ),
                },
            ],
            opacity:
                1 -
                2.5 *
                    Math.max(
                        (modalMinifiedTop - modalTop.value) /
                            (modalMinifiedTop - top),
                        0,
                    ),
        };
    });

    const modalStyle = useAnimatedStyle(() => {
        return {
            height: modalHeight.value,
            top: modalTop.value,
            opacity:
                (1.1 *
                    (MINIFIED_MODAL_HEIGHT +
                        modalMinifiedTop -
                        modalTop.value)) /
                MINIFIED_MODAL_HEIGHT,
        };
    });

    const removeChatModal = useCallback(
        (local?: boolean) => {
            // setModalVisible(false);
            // if (type && roomName && !local) {
            //     socket?.emit(`exit_${type}`, { roomName });
            // }
            modalTop.value = screen.height;
            modalHeight.value = modalMaxHeight;
            roomInfo?.socket?.disconnect();

            setRoomInfo(undefined);
        },
        [modalHeight, modalTop],
    );

    const closeChatModal = useCallback(
        (local?: boolean) => {
            modalTop.value = withTiming(
                screen.height,
                undefined,
                isFinished => {
                    if (!isFinished) return;
                    runOnJS(removeChatModal)(local);
                },
            );
        },
        [modalTop, removeChatModal],
    );

    const openChatModal = useCallback(
        ({
            socket: connectedSocket,
            roomName: connectedRoomName,
            type: connectedType,
        }: {
            socket: Socket;
            roomName: string;
            type: 'visitor' | 'owner';
        }) => {
            // if (!modalMaxHeight || !modalMinifiedTop) return;
            setRoomInfo({
                socket: connectedSocket,
                roomName: connectedRoomName,
                type: connectedType,
            });
            // setModalVisible(true);
            modalHeight.value = modalMaxHeight;
            modalTop.value = withTiming(top);
        },
        [modalHeight, modalTop, top],
    );

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
            if (!ctx.minY && !ctx.maxY) {
                // 풀스크린 상태에서 제스쳐를 시작한 경우
                if (ctx.firstModalTop === top) {
                    ctx.minY = top;
                    ctx.maxY = modalMinifiedTop;
                }
                // 최소화 상태에서 제스쳐를 시작한 경우
                else if (ctx.firstModalTop === modalMinifiedTop) {
                    // 올리는 제스쳐
                    if (event.translationY < 0) {
                        ctx.minY = top;
                        ctx.maxY = modalMinifiedTop;
                    }
                    // 내리는 제스쳐
                    else if (event.translationY > 0) {
                        ctx.minY = modalMinifiedTop;
                        ctx.maxY = screen.height + TAB_BAR_HEIGHT;
                    }
                }
            }

            if (!ctx.minY && !ctx.maxY) return;

            const newTop = Math.max(
                Math.min(ctx.firstModalTop + event.translationY, ctx.maxY),
                ctx.minY,
            );

            const newHeight = Math.max(
                MINIFIED_MODAL_HEIGHT +
                    modalMaxHeight *
                        (1 - (newTop - top) / (modalMinifiedTop - top)),
                MINIFIED_MODAL_HEIGHT,
            );

            modalHeight.value = newHeight;
            modalTop.value = newTop;
        },
        onEnd: (event, ctx) => {
            ctx.animating = false;
            ctx.minY = 0;
            ctx.maxY = 0;

            // 최소화 상태에서 제스쳐를 시작한 경우
            if (ctx.firstModalTop === modalMinifiedTop) {
                // 내리는 제스쳐
                // 사라지게 한다.
                if (
                    event.translationY > 0 &&
                    event.translationY > (TAB_BAR_HEIGHT + bottom) * 0.1
                ) {
                    modalTop.value = withTiming(
                        screen.height,
                        undefined,
                        finished => {
                            if (!finished) return;
                            runOnJS(removeChatModal)();
                        },
                    );
                }
                // 복원한다.
                else if (event.translationY > 0) {
                    modalTop.value = withTiming(modalMinifiedTop);
                }
                // 올리는 제스쳐
                // 최대화한다.
                else if (
                    event.translationY < 0 &&
                    -event.translationY > modalMaxHeight * 0.1
                ) {
                    modalTop.value = withTiming(top);
                    modalHeight.value = withTiming(modalMaxHeight);
                }
                // 복원한다.
                else if (event.translationY < 0) {
                    modalTop.value = withTiming(modalMinifiedTop);
                    modalHeight.value = withTiming(MINIFIED_MODAL_HEIGHT);
                }
            }
            // 최대화 상태에서 제스쳐를 시작한 경우
            else if (ctx.firstModalTop === top) {
                // 최소화한다.
                if (event.absoluteY > modalMaxHeight * 0.2) {
                    modalTop.value = withTiming(modalMinifiedTop);
                    modalHeight.value = withTiming(MINIFIED_MODAL_HEIGHT);
                }
                // 복원한다.
                else {
                    modalTop.value = withTiming(top);
                    modalHeight.value = withTiming(modalMaxHeight);
                }
            }
        },
    });

    return (
        <View
            style={{
                flex: 1,
                backgroundColor: '#ffffff',
            }}>
            <Tab.Navigator
                screenOptions={{
                    headerShown: false,
                    tabBarStyle: {
                        display: 'none',
                    },
                }}>
                <Tab.Screen
                    name="Zoom"
                    component={Zoom}
                    initialParams={{
                        openChatModal,
                        closeChatModal,
                    }}
                />
                <Tab.Screen name="KakaoWebtoon" component={KakaoWebtoon} />
            </Tab.Navigator>

            {roomInfo && (
                <PanGestureHandler onGestureEvent={onModalGestureEvent}>
                    <Animated.View
                        style={[
                            modalStyle,
                            {
                                position: 'absolute',
                                width: window.width,
                            },
                        ]}>
                        <ZoomModal
                            {...roomInfo}
                            modalHeight={modalHeight}
                            modalTop={modalTop}
                            modalMaxHeight={modalMaxHeight}
                            modalMinifiedTop={modalMinifiedTop}
                        />
                    </Animated.View>
                </PanGestureHandler>
            )}

            <Animated.View
                style={[
                    tabBarStyle,
                    {
                        height: TAB_BAR_HEIGHT + bottom,
                        paddingBottom: bottom,
                        flexDirection: 'row',
                        borderTopColor: '#000000',
                        borderTopWidth: 0.5,
                        backgroundColor: '#ffffff',
                    },
                ]}>
                {tabs.map((tab, index) => {
                    const isFocused = currentIndex === index;

                    const onPress = () => {
                        setCurrentIndex(index);
                        navigation.navigate(
                            tab.name,
                            index === 0
                                ? {
                                      openChatModal,
                                      closeChatModal,
                                  }
                                : undefined,
                        );
                    };

                    return (
                        <TouchableWithoutFeedback
                            onPress={onPress}
                            key={tab.name}>
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
                                    {tab.label}
                                </Animated.Text>
                            </Animated.View>
                        </TouchableWithoutFeedback>
                    );
                })}
            </Animated.View>
        </View>
    );
};
