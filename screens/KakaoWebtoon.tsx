import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useCallback } from 'react';
import CircularScrollView from '../components/CircularScrollView';
import { data, DataProps } from '../Constants/data';
import { MainStackParamList } from '../navigations/StackNavigation';
import SharedItem from '../components/SharedItem';

type TabStackNavigationProp = StackNavigationProp<MainStackParamList, 'Tab'>;

export default () => {
    const navigation = useNavigation<TabStackNavigationProp>();

    const onPress = useCallback(
        (props: {
            image: string;
            title: string;
            desc: string;
            index: number;
            order: number;
        }) => {
            navigation.navigate('WebtoonDetail', props);
        },
        [navigation],
    );

    const renderItem = useCallback(
        ({
            item,
            index,
            order,
        }: {
            item: DataProps;
            index: number;
            order: number;
        }) => {
            return (
                <SharedItem
                    {...item}
                    index={index}
                    order={order}
                    onPress={onPress}
                />
            );
        },
        [onPress],
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
