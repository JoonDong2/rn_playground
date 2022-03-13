import React, { useCallback, useRef } from 'react';
import {
    StyleProp,
    Text,
    TouchableWithoutFeedback,
    ViewStyle,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import Animated from 'react-native-reanimated';
import { SharedElement } from 'react-navigation-shared-element';
import { screen } from '../Constants';
import ItemCover from './ItemCover';

interface SharedItemProps {
    image: string;
    title: string;
    desc: string;
    index: number;
    order: number;
    style?: StyleProp<ViewStyle>;
    onPress?: (props: {
        image: string;
        title: string;
        desc: string;
        index: number;
        order: number;
    }) => void;
}

export default ({
    image,
    title,
    desc,
    index,
    order,
    style,
    onPress: onPressProp,
}: SharedItemProps) => {
    const onPress = useCallback(() => {
        if (onPressProp) onPressProp({ image, title, desc, index, order });
    }, [desc, image, index, onPressProp, order, title]);

    const coverWidth = useRef(screen.width / 1.75).current;

    return (
        <TouchableWithoutFeedback onPress={onPress}>
            <Animated.View
                style={{
                    overflow: 'hidden',
                    width: screen.width,
                    height: 300,
                }}>
                <SharedElement id={`${index}-${order}.image`}>
                    <FastImage
                        source={{ uri: image }}
                        style={{ width: screen.width, height: 300 }}
                        resizeMode="cover"
                    />
                </SharedElement>
                <SharedElement
                    style={[
                        {
                            position: 'absolute',
                        },
                    ]}
                    id={`${index}-${order}.left-cover`}>
                    <ItemCover
                        direction="left"
                        odd={index % 2 === 1}
                        height={300}
                        width={coverWidth}
                    />
                </SharedElement>
                <SharedElement
                    style={[
                        {
                            position: 'absolute',
                            right: 0,
                        },
                    ]}
                    id={`${index}-${order}.right-cover`}>
                    <ItemCover
                        direction="right"
                        odd={index % 2 === 1}
                        height={300}
                        width={coverWidth}
                    />
                </SharedElement>
                <Text
                    style={{
                        color: '#ffffff',
                        fontWeight: 'bold',
                        fontSize: 20,
                        position: 'absolute',
                        top: 100,
                        left: 30,
                    }}>
                    {title}
                </Text>
                <Text
                    style={{
                        color: '#acacac',
                        fontWeight: 'bold',
                        fontSize: 16,
                        position: 'absolute',
                        top: 130,
                        left: 30,
                    }}>
                    {desc}
                </Text>
            </Animated.View>
        </TouchableWithoutFeedback>
    );
};
