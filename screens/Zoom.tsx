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
    RefreshControl,
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
import axios from 'axios';

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
        params: { openChatModal, closeChatModal },
    },
}: ZoomProps) => {
    const { top } = useSafeAreaInsets();

    const [isInChat, setIsInChat] = useState(false);
    const [enteringLoading, setEnteringLoading] = useState(false);

    // (!chatList && loading)인 경우만 스피너가 나타난다.
    const [loading, setLoading] = useState(false);
    const [chatList, setChatList] = useState<RoomProps[] | undefined>(
        undefined,
    );

    const getChatList = useCallback(async (disableLoading?: boolean) => {
        setLoading(!disableLoading);
        try {
            const res = await axios.get(CHAT_LIST_END_POINT);
            if (res.status !== 200) throw new Error();
            const chatList = await res.data;
            setChatList(chatList);
        } catch (e) {
            setChatList([]);
        }
        setLoading(false);
    }, []);

    const [keyboardDidShow, setKeybaordDidShow] = useState(false);
    const [modalVisible, setModalVisible] = useState<
        'enter' | 'create' | undefined
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

    const openChat = useCallback(() => {
        const { nickname, roomName } = texts;
        if (!nickname || !roomName) return;

        setEnteringLoading(true);
        const type = modalVisible === 'create' ? 'owner' : 'visitor';
        const socket = getSocket({
            ...texts,
            type,
        });
        socket.on('disconnect', () => {
            setEnteringLoading(false);
            socket.removeAllListeners();
            setIsInChat(false);
            getChatList();
        });
        socket.on('disconnect_message', (message: string) => {
            setEnteringLoading(false);
            Alert.alert('오류', message, [
                {
                    text: '확인',
                    onPress: () => getChatList(),
                },
            ]);
            socket.removeAllListeners();
            setIsInChat(false);
        });
        socket.on('connect_successful', () => {
            setEnteringLoading(false);
            Keyboard.dismiss();
            setModalVisible(undefined);
            setTimeout(() => {
                setTexts({
                    nickname: '',
                    roomName: '',
                    password: '',
                });
                setIsInChat(true);
                openChatModal({
                    socket,
                    roomName: texts.roomName,
                    ownerName: texts.nickname,
                    type,
                });
            }, 250);
        });
        socket.on('exit_visitor', (paylaod: { nickname: string }) => {
            Alert.alert('알림', `${paylaod.nickname}님이 나갔습니다.`, [
                {
                    text: '확인',
                    onPress: () => getChatList(),
                },
            ]);
        });
        socket.on('exit_owner', (paylaod: { nickname: string }) => {
            Alert.alert('알림', `${paylaod.nickname}님이 나갔습니다.`, [
                {
                    text: '확인',
                    onPress: () => getChatList(),
                },
            ]);
            socket.disconnect();
            closeChatModal(true);
        });
    }, [texts, modalVisible, getChatList, openChatModal, closeChatModal]);

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

    const onPress = useCallback(
        (item: RoomProps) => {
            if (isInChat) return;
            const { roomName } = item;
            setTexts({
                roomName,
                nickname: '',
                password: '',
            });
            setModalVisible('enter');
        },
        [isInChat],
    );

    const renderItem = useCallback(
        ({ item }: { item: RoomProps }) => {
            return <ChatItem item={item} onPress={onPress} />;
        },
        [onPress],
    );

    const [refreshing, setRefreshing] = useState(false);
    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await getChatList(true);
        setRefreshing(false);
    }, [getChatList]);

    return (
        <View
            style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
            }}>
            <FlatList
                style={{ paddingTop: top, flex: 1, width: screen.width }}
                data={chatList}
                renderItem={renderItem}
                keyExtractor={(item: RoomProps) => item.roomName}
                bounces
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                    />
                }
            />
            <TouchableOpacity
                style={{
                    position: 'absolute',
                    bottom: 20,
                    right: 20,
                    width: 50,
                    height: 50,
                    borderRadius: 25,
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: '#007fff',
                }}
                disabled={isInChat}
                onPress={createChat}>
                <Text
                    style={{
                        color: '#ffffff',
                        fontSize: 35,
                        includeFontPadding: false,
                        paddingBottom: isAndroid ? 0 : 3,
                    }}>
                    +
                </Text>
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
                                height: 240,
                                justifyContent: 'center',
                                alignItems: 'center',
                                borderRadius: 10,
                                backgroundColor: '#ffffff',
                            }}>
                            <View
                                style={{
                                    width: 250,
                                    height: 35,
                                    flexDirection: 'row',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    borderWidth: 1,
                                    borderColor: '#aaaaaa',
                                    borderRadius: 5,
                                    marginBottom: 15,
                                }}>
                                <TextInput
                                    style={{
                                        flex: 1,
                                        textAlign: 'center',
                                        color: '#000000',
                                        padding: 0,
                                        includeFontPadding: false,
                                    }}
                                    value={texts.nickname}
                                    onChangeText={onChangeNickname}
                                    autoCapitalize="none"
                                    placeholder="닉네임"
                                />
                            </View>
                            <View
                                style={{
                                    width: 250,
                                    height: 35,
                                    flexDirection: 'row',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    borderWidth: 1,
                                    borderColor: '#aaaaaa',
                                    borderRadius: 5,
                                    marginBottom: 15,
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
                                    autoCapitalize="none"
                                    placeholder="방 이름"
                                />
                            </View>
                            <View
                                style={{
                                    width: 250,
                                    height: 35,
                                    flexDirection: 'row',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    borderWidth: 1,
                                    borderColor: '#aaaaaa',
                                    borderRadius: 5,
                                    marginBottom: 15,
                                }}>
                                <TextInput
                                    style={{
                                        flex: 1,
                                        textAlign: 'center',
                                        color: '#000000',
                                        padding: 0,
                                        includeFontPadding: false,
                                    }}
                                    value={texts.password}
                                    onChangeText={onChangePassword}
                                    textContentType="password"
                                    secureTextEntry
                                    autoCapitalize="none"
                                    placeholder="비밀번호"
                                />
                            </View>
                            <TouchableOpacity
                                onPress={openChat}
                                disabled={enteringLoading}
                                style={{
                                    width: 250,
                                    height: 35,
                                    borderRadius: 5,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    backgroundColor: '#007fff',
                                }}>
                                {!enteringLoading ? (
                                    <Text style={{ color: '#ffffff' }}>
                                        {modalVisible === 'create'
                                            ? '방 생성'
                                            : '입장'}
                                    </Text>
                                ) : (
                                    <ActivityIndicator
                                        size="small"
                                        color="#ffffff"
                                    />
                                )}
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
