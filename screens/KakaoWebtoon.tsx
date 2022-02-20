import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useCallback, useState } from 'react';
import { TouchableWithoutFeedback } from 'react-native';
import Animated from 'react-native-reanimated';
import { SharedElement } from 'react-navigation-shared-element';
import CircularScrollView from '../components/CircularScrollView';
import { screen } from '../Constants';
import { data, DataProps } from '../Constants/data';
import { MainStackParamList } from '../navigations/StackNavigation';
import FastImage from 'react-native-fast-image';
import SharedItem from '../components/SharedItem';

type TabStackNavigationProp = StackNavigationProp<MainStackParamList, 'Tab'>;

export default () => {
    const [selectedIndex, setSelectedIndex] = useState<number | undefined>(
        undefined,
    );

    const navigation = useNavigation<TabStackNavigationProp>();

    const onPress = useCallback(
        (props: {
            image: string;
            title: string;
            desc: string;
            index: number;
        }) => {
            setSelectedIndex(props.index);
            navigation.navigate('WebtoonDetail', props);
        },
        [navigation],
    );

    const renderItem = useCallback(
        ({ item, index }: { item: DataProps; index: number }) => {
            return (
                <SharedItem
                    {...item}
                    index={index}
                    selected={selectedIndex === index}
                    onPress={onPress}
                />
            );
        },
        [onPress, selectedIndex],
    );

    useFocusEffect(() => {
        setSelectedIndex(undefined);
    });

    return (
        <CircularScrollView
            style={{ flex: 1 }}
            data={data}
            itemHeight={300}
            renderItem={renderItem}
        />
    );
};
