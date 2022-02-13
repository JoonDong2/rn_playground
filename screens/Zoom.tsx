import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { CompositeNavigationProp, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Keyboard,
    KeyboardAvoidingView,
    Modal,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getSocket } from '../api/socket';
import ChatItem from '../components/ChatItem';
import { isAndroid, CHAT_LIST_END_POINT, screen } from '../Constants';
import { MainStackParamList } from '../navigations/StackNavigation';
import { RootTabNavigationProp } from '../navigations/TabNavigation';

type ZoomRouteProp = RouteProp<RootTabNavigationProp, 'Zoom'>;

type ZoomNavigationProp = CompositeNavigationProp<
    StackNavigationProp<MainStackParamList, 'Tab'>,
    BottomTabNavigationProp<RootTabNavigationProp, 'Zoom'>
>;

export interface RoomProps {
    roomName: string;
    peerNickname: string;
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
    const { top } = useSafeAreaInsets();

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

        const socket = getSocket({
            ...texts,
            type: modalVisible === 'create' ? 'owner' : 'visitor',
        });
        socket.on('disconnect', () => {
            socket.removeAllListeners();
        });
        socket.on('disconnect_message', (message: string) => {
            Alert.alert('오류', message);
            socket.removeAllListeners();
        });
        socket.on('connect_successful', () => {
            Keyboard.dismiss();
            setModalVisible(undefined);
            setTimeout(() => {
                setTexts({
                    nickname: '',
                    roomName: '',
                    password: '',
                });
                openChatModal();
            }, 250);
        });
    }, [texts, modalVisible, openChatModal]);

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
        try {
            const res = await fetch(CHAT_LIST_END_POINT);
            if (res.status !== 200) throw new Error();
            const chatList = await res.json();
            setChatList(chatList);
        } catch (e) {
            setChatList([]);
        }
        setLoading(false);
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

    const onPress = useCallback((item: RoomProps) => {
        console.log(item);
    }, []);

    const renderItem = useCallback(
        ({ item }: { item: RoomProps }) => {
            return <ChatItem item={item} onPress={onPress} />;
        },
        [onPress],
    );

    return (
        <View
            style={{
                paddingTop: top,
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
            }}>
            <TouchableOpacity
                onPress={getChatList}
                style={{
                    width: screen.width,
                    height: 50,
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderBottomWidth: 0.5,
                    borderBottomColor: '#aaaaaa',
                }}>
                <Text>새로고침</Text>
            </TouchableOpacity>
            <FlatList
                style={{ flex: 1 }}
                data={chatList}
                renderItem={renderItem}
                keyExtractor={(item: RoomProps) => item.roomName}
            />
            <TouchableOpacity
                style={{
                    width: screen.width,
                    height: 50,
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderTopWidth: 0.5,
                    borderTopColor: '#aaaaaa',
                }}
                onPress={createChat}>
                <Text>방 생성</Text>
            </TouchableOpacity>
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
            {loading && (
                <ActivityIndicator
                    style={{ position: 'absolute' }}
                    size="large"
                    color="#aaaaaa"
                />
            )}
            {chatList?.length === 0 && !loading && (
                <Text style={{ position: 'absolute' }}>방이 없습니다.</Text>
            )}
        </View>
    );
};
