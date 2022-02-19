import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { CompositeNavigationProp, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useRef } from 'react';
import { View } from 'react-native';
import { MainStackParamList } from '../navigations/StackNavigation';
import { RootTabNavigationProp } from '../navigations/TabNavigation';

type WebtoonDetailRouteProp = RouteProp<MainStackParamList, 'WebtoonDetail'>;

type WebtoonDetailNavigationProp = CompositeNavigationProp<
    StackNavigationProp<MainStackParamList, 'WebtoonDetail'>,
    BottomTabNavigationProp<RootTabNavigationProp, 'Zoom'>
>;

type WebtoonDetailProps = {
    route: WebtoonDetailRouteProp;
    navigation: WebtoonDetailNavigationProp;
};

export default ({ route }: WebtoonDetailProps) => {
    const image = useRef(route.params.image).current;

    return (
        <View />
    )
}