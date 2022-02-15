import React, { useCallback } from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { screen } from '../Constants';
import { RoomProps } from '../screens/Zoom';

interface ChatItemProps {
    item: RoomProps;
    onPress: (props: RoomProps) => void;
}

const ChatItem = ({ item, onPress: onPressProp }: ChatItemProps) => {
    const onPress = useCallback(() => {
        onPressProp(item);
    }, [item, onPressProp]);

    return (
        <TouchableOpacity
            onPress={onPress}
            style={{
                width: screen.width,
                height: 50,
                borderBottomWidth: 0.5,
                borderBottomColor: '#aaaaaa',
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 15,
            }}>
            <Text numberOfLines={1} ellipsizeMode="tail">
                방이름: {item.roomName}, 닉네임: {item.peerNickname}
            </Text>
        </TouchableOpacity>
    );
};

export default React.memo(ChatItem);
