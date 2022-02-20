import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useRef } from 'react';
import { TouchableWithoutFeedback, View } from 'react-native';
import { SharedElement } from 'react-navigation-shared-element';
import { MainStackParamList } from '../navigations/StackNavigation';
import FastImage from 'react-native-fast-image';
import { screen, window } from '../Constants';
import ItemCover from '../components/ItemCover';

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
    const coverWidth = useRef(screen.width / 1.75).current;

    return (
        <TouchableWithoutFeedback onPress={navigation.goBack}>
            <View style={{ flex: 1 }}>
                <SharedElement id={`${index}-${image}.image`}>
                    <FastImage
                        testID="DetailImage"
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
                    <ItemCover
                        direction="left"
                        odd={index % 2 === 1}
                        height={window.height}
                        width={coverWidth}
                        isDetail
                    />
                </SharedElement>
                <SharedElement
                    style={{
                        right: 0,
                        position: 'absolute',
                    }}
                    id={`${index}-${image}.right-cover`}>
                    <ItemCover
                        direction="right"
                        odd={index % 2 === 1}
                        height={window.height}
                        width={coverWidth}
                        isDetail
                    />
                </SharedElement>
            </View>
        </TouchableWithoutFeedback>
    );
};
