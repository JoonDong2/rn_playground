import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { CompositeNavigationProp, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Keyboard,
    KeyboardAvoidingView,
    Modal,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from 'react-native';
import { isAndroid, screen } from '../Constants';
import { MainStackParamList } from '../navigations/StackNavigation';
import { RootTabNavigationProp } from '../navigations/TabNavigation';

type ZoomRouteProp = RouteProp<RootTabNavigationProp, 'Zoom'>;

type ZoomNavigationProp = CompositeNavigationProp<
    StackNavigationProp<MainStackParamList, 'Tab'>,
    BottomTabNavigationProp<RootTabNavigationProp, 'Zoom'>
>;

interface RoomProps {
    roomName: string;
    peerNickname: string;
    roomId?: boolean;
}

type ZoomProps = {
    route: ZoomRouteProp;
    navigation: ZoomNavigationProp;
};

export default ({
    route: {
        params: { openChatModal },
    },
}: ZoomProps) => {
    // (!chatList && loading)인 경우만 스피너가 나타난다.
    const [loading, setLoading] = useState(false);
    const [chatList, setChatList] = useState<RoomProps[] | undefined>(
        undefined,
    );

    const [keyboardDidShow, setKeybaordDidShow] = useState(false);
    const [modalVisible, setModalVisible] = useState<
        'enterFreeRoom' | 'enterPrivateRoom' | 'create' | undefined
    >(undefined);

    const [texts, setTexts] = useState({
        nickname: '',
        roomName: '',
        password: '',
    });

    const onChangeNickname = useCallback((text: string) => {
        setTexts(prev => ({
            ...prev,
            nickname: text,
        }));
    }, []);

    const onChangeRoomName = useCallback((text: string) => {
        setTexts(prev => ({
            ...prev,
            roomName: text,
        }));
    }, []);

    const onChangePassword = useCallback((text: string) => {
        setTexts(prev => ({
            ...prev,
            password: text,
        }));
    }, []);

    const createChat = useCallback(async () => {
        if (texts.roomName) return;
        setModalVisible('create');
    }, [texts]);

    const enterChat = useCallback(() => {
        if (!texts.roomName) return;
        // setModalVisible('enterFreeRoom');
        // setModalVisible('enterPrivateRoom');
    }, [texts]);

    const openChat = useCallback(() => {
        const { nickname, roomName } = texts;
        if (!nickname || !roomName) return;
        // TODO: 닉네임 중복체크
        // TODO: 비밀번호가 있는 방이라면, 사용자가 입력한 비밀번호를 사용해서 roomId 얻어오기
        Keyboard.dismiss();
        setModalVisible(undefined);
        setTimeout(() => {
            openChatModal();
        }, 250);
    }, [texts, openChatModal]);

    const dismissModal = useCallback(() => {
        if (keyboardDidShow) Keyboard.dismiss();
        else {
            setModalVisible(undefined);
            setTexts({
                nickname: '',
                roomName: '',
                password: '',
            });
        }
    }, [keyboardDidShow]);

    const getChatList = useCallback(async () => {
        setLoading(true);
        // TODO: 채팅 리스트 가져오기
        setLoading(false);
        setChatList([]);
    }, []);

    useEffect(() => {
        getChatList();

        // 키보드
        const showSubscription = Keyboard.addListener('keyboardDidShow', () => {
            setKeybaordDidShow(true);
        });
        const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
            setKeybaordDidShow(false);
        });

        return () => {
            showSubscription.remove();
            hideSubscription.remove();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <View
            style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
            }}>
            {/* TODO: 상단 새로고침 버튼 */}
            {/* TODO: 채팅 리스트 */}
            <Modal transparent visible={!!modalVisible} animationType="fade">
                <KeyboardAvoidingView
                    enabled
                    behavior={isAndroid ? 'height' : 'padding'}
                    keyboardVerticalOffset={-150}
                    style={{
                        flex: 1,
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}>
                    <>
                        <TouchableWithoutFeedback onPress={dismissModal}>
                            <View
                                style={{
                                    position: 'absolute',
                                    width: screen.width,
                                    height: screen.height,
                                    backgroundColor: 'rgba(0,0,0,0.25)',
                                }}
                            />
                        </TouchableWithoutFeedback>

                        <View
                            style={{
                                width: 300,
                                height: 205,
                                justifyContent: 'center',
                                alignItems: 'center',
                                borderRadius: 10,
                                backgroundColor: '#ffffff',
                            }}>
                            <View
                                style={{
                                    width: 250,
                                    height: 30,
                                    flexDirection: 'row',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    borderWidth: 1,
                                    borderColor: '#aaaaaa',
                                    borderRadius: 5,
                                    marginBottom: 10,
                                }}>
                                <TextInput
                                    style={{
                                        flex: 1,
                                        textAlign: 'center',
                                        color: '#000000',
                                        padding: 0,
                                        includeFontPadding: false,
                                    }}
                                    placeholder="닉네임"
                                    value={texts.nickname}
                                    onChangeText={onChangeNickname}
                                />
                            </View>
                            <View
                                style={{
                                    width: 250,
                                    height: 30,
                                    flexDirection: 'row',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    borderWidth: 1,
                                    borderColor: '#aaaaaa',
                                    borderRadius: 5,
                                    marginBottom: 10,
                                }}>
                                <TextInput
                                    style={{
                                        flex: 1,
                                        textAlign: 'center',
                                        color:
                                            modalVisible === 'create'
                                                ? '#000000'
                                                : '#aaaaaa',
                                        padding: 0,
                                        includeFontPadding: false,
                                    }}
                                    editable={modalVisible === 'create'}
                                    value={texts.roomName}
                                    onChangeText={onChangeRoomName}
                                    placeholder="방 이름"
                                />
                            </View>
                            <View
                                style={{
                                    width: 250,
                                    height: 30,
                                    flexDirection: 'row',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    borderWidth: 1,
                                    borderColor: '#aaaaaa',
                                    borderRadius: 5,
                                    marginBottom: 10,
                                }}>
                                <TextInput
                                    style={{
                                        flex: 1,
                                        textAlign: 'center',
                                        color:
                                            modalVisible === 'enterPrivateRoom'
                                                ? '#000000'
                                                : '#aaaaaa',
                                        padding: 0,
                                        includeFontPadding: false,
                                    }}
                                    value={texts.password}
                                    onChangeText={onChangePassword}
                                    textContentType="password"
                                    placeholder="비밀번호"
                                />
                            </View>
                            <TouchableOpacity
                                onPress={openChat}
                                style={{
                                    width: 250,
                                    height: 30,
                                    borderRadius: 5,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    backgroundColor: '#007fff',
                                }}>
                                <Text style={{ color: '#ffffff' }}>
                                    {modalVisible === 'create'
                                        ? '방 생성'
                                        : '입장'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </>
                </KeyboardAvoidingView>
            </Modal>
            {!chatList && loading ? (
                <ActivityIndicator
                    style={{ position: 'absolute' }}
                    size="large"
                    color="#00ff00"
                />
            ) : null}
        </View>
    );
};
