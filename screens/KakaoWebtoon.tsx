import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useCallback } from 'react';
import { TouchableWithoutFeedback } from 'react-native';
import Animated from 'react-native-reanimated';
import { SharedElement } from 'react-navigation-shared-element';
import CircularScrollView from '../components/CircularScrollView';
import { screen } from '../Constants';
import { data, DataProps } from '../Constants/data';
import { MainStackParamList } from '../navigations/StackNavigation';
import FastImage from 'react-native-fast-image';

type TabStackNavigationProp = StackNavigationProp<MainStackParamList, 'Tab'>;

export default () => {
    const navigation = useNavigation<TabStackNavigationProp>();
    const renderItem = useCallback(
        ({
            item: { image, title, desc },
            index,
        }: {
            item: DataProps;
            index: number;
        }) => {
            return (
                <TouchableWithoutFeedback
                    onPress={() =>
                        navigation.navigate('WebtoonDetail', {
                            image,
                            title,
                            desc,
                            index,
                        })
                    }>
                    <Animated.View
                        style={{
                            width: screen.width,
                            height: 300,
                        }}>
                        <SharedElement id={`${index}-${image}`}>
                            <FastImage
                                source={{ uri: image }}
                                style={{ width: screen.width, height: 300 }}
                                resizeMode="cover"
                            />
                        </SharedElement>
                    </Animated.View>
                </TouchableWithoutFeedback>
            );
        },
        [navigation],
    );
    return (
        <CircularScrollView
            style={{ flex: 1 }}
            data={data}
            itemHeight={300}
            renderItem={renderItem}
        />
    );
};
