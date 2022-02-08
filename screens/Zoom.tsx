import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { CompositeNavigationProp, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
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
        params: { openModal, closeModal },
    },
    navigation,
}: ZoomProps) => {
    return (
        <View
            style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
            }}>
            <TouchableOpacity onPress={openModal}>
                <Text>Zoom 클론</Text>
            </TouchableOpacity>
        </View>
    );
};
