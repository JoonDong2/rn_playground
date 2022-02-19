import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { CompositeNavigationProp, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useRef } from 'react';
import { Text, TouchableWithoutFeedback, View } from 'react-native';
import { SharedElement } from 'react-navigation-shared-element';
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

export default ({ route, navigation }: WebtoonDetailProps) => {
    const image = useRef(route.params.image).current;

    return (
        <TouchableWithoutFeedback onPress={navigation.goBack}>
            <View style={{ flex: 1 }}>
                <SharedElement id={image}>
                    <Text>123</Text>
                </SharedElement>
            </View>
        </TouchableWithoutFeedback>
    )
}