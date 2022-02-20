import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useRef } from 'react';
import { Text, TouchableWithoutFeedback, View } from 'react-native';
import { SharedElement } from 'react-navigation-shared-element';
import { MainStackParamList } from '../navigations/StackNavigation';

type WebtoonDetailNavigationProp = StackNavigationProp<
    MainStackParamList,
    'WebtoonDetail'
>;
type WebtoonDetailRouteProp = RouteProp<MainStackParamList, 'WebtoonDetail'>;

interface WebtoonDetailProps {
    navigation: WebtoonDetailNavigationProp;
    route: WebtoonDetailRouteProp;
}

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
    );
};
