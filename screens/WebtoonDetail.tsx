import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useRef } from 'react';
import { TouchableWithoutFeedback, View } from 'react-native';
import { SharedElement } from 'react-navigation-shared-element';
import { MainStackParamList } from '../navigations/StackNavigation';
import FastImage from 'react-native-fast-image';
import { screen, window } from '../Constants';

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
    const { image, title, desc, index } = useRef(route.params).current;

    return (
        <TouchableWithoutFeedback onPress={navigation.goBack}>
            <View style={{ flex: 1 }}>
                <SharedElement id={`${index}-${image}`}>
                    <FastImage
                        style={{ width: screen.width, height: window.height }}
                        source={{ uri: image }}
                        resizeMode="cover"
                    />
                </SharedElement>
            </View>
        </TouchableWithoutFeedback>
    );
};
