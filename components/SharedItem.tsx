import React, { useCallback, useRef } from 'react';
import { StyleProp, TouchableWithoutFeedback, ViewStyle } from 'react-native';
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
    style,
    onPress: onPressProp,
}: SharedItemProps) => {
    const onPress = useCallback(() => {
        if (onPressProp) onPressProp({ image, title, desc, index });
    }, [desc, image, index, onPressProp, title]);

    const coverWidth = useRef(screen.width / 1.75).current;

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
                    id={`${index}-${image}.right-cover`}>
                    <ItemCover
                        direction="right"
                        odd={index % 2 === 1}
                        height={300}
                        width={coverWidth}
                    />
                </SharedElement>
            </Animated.View>
        </TouchableWithoutFeedback>
    );
};
