import React, { useCallback } from 'react';
import {
    StyleProp,
    TouchableWithoutFeedback,
    View,
    ViewStyle,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import Animated from 'react-native-reanimated';
import { SharedElement } from 'react-navigation-shared-element';
import { screen } from '../Constants';

interface SharedItemProps {
    image: string;
    title: string;
    desc: string;
    index: number;
    selected?: boolean;
    style?: StyleProp<ViewStyle>;
    onPress?: (props: {
        image: string;
        title: string;
        desc: string;
        index: number;
    }) => void;
}

export default ({
    image,
    title,
    desc,
    index,
    selected,
    style,
    onPress: onPressProp,
}: SharedItemProps) => {
    const onPress = useCallback(() => {
        if (onPressProp) onPressProp({ image, title, desc, index });
    }, [desc, image, index, onPressProp, title]);

    return (
        <TouchableWithoutFeedback onPress={onPress}>
            <Animated.View
                style={{
                    overflow: 'hidden',
                    width: screen.width,
                    height: 300,
                }}>
                <SharedElement id={`${index}-${image}.image`}>
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
                    style={[
                        {
                            position: 'absolute',
                            right: 0,
                        },
                    ]}
                    id={`${index}-${image}.right-cover`}>
                    <View
                        style={{
                            width: 100,
                            height: 100,
                            backgroundColor: 'green',
                        }}
                    />
                </SharedElement>
            </Animated.View>
        </TouchableWithoutFeedback>
    );
};
