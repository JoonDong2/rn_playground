import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { CompositeNavigationProp, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useCallback, useState } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import { MainStackParamList } from '../navigations/StackNavigation';
import { RootTabNavigationProp } from '../navigations/TabNavigation';

type ZoomRouteProp = RouteProp<RootTabNavigationProp, 'Zoom'>;

type ZoomNavigationProp = CompositeNavigationProp<
    StackNavigationProp<MainStackParamList, 'Tab'>,
    BottomTabNavigationProp<RootTabNavigationProp, 'Zoom'>
>;

type ZoomProps = {
    route: ZoomRouteProp;
    navigation: ZoomNavigationProp;
};

export default ({
    route: {
        params: { openModal },
    },
    navigation,
}: ZoomProps) => {
    const [nickname, setNickname] = useState('');
    const onChangeText = useCallback((text: string) => {
        setNickname(text);
    }, []);

    const createChat = useCallback(() => {
        console.log("Zoom::createChat", nickname);
        // TODO: 닉네임 중복 체크
        // TODO: 소켓 연결
    }, [nickname]);

    return (
        <View
            style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
            }}>
            <TextInput
                style={{
                    borderColor: '#000000',
                    marginBottom: 10,
                }}
                value={nickname}
                onChangeText={onChangeText}
                placeholder="닉네임을 입력해 주세요."
            />
            <TouchableOpacity style={{ marginBottom: 10 }} onPress={createChat}>
                <Text>연결</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={openModal}>
                <Text>Zoom 클론</Text>
            </TouchableOpacity>
        </View>
    );
};
