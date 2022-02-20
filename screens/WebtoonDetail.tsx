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
                <SharedElement id={`${index}-${image}.image`}>
                    <FastImage
                        style={{ width: screen.width, height: window.height }}
                        source={{ uri: image }}
                        resizeMode="cover"
                    />
                </SharedElement>
                <SharedElement
                    style={{
                        overflow: 'hidden',
                        position: 'absolute',
                    }}
                    id={`${index}-${image}.left-cover`}>
                    <View
                        style={{
                            width: 100,
                            height: 100,
                            backgroundColor: 'green',
                        }}
                    />
                </SharedElement>
                <SharedElement
                    style={{
                        right: 0,
                        position: 'absolute',
                    }}
                    id={`${index}-${image}.right-cover`}>
                    <View
                        style={{
                            width: 100,
                            height: 100,
                            backgroundColor: 'green',
                        }}
                    />
                </SharedElement>
            </View>
        </TouchableWithoutFeedback>
    );
};
