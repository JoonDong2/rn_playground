import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { CompositeNavigationProp, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React from 'react';
import { Text, TouchableWithoutFeedback, View } from 'react-native';
import { SharedElement } from 'react-navigation-shared-element';
import CircularScrollView from '../components/CircularScrollView';
import {
    overflowData,
    dataWithSpare,
} from '../components/CircularScrollView/testData';
import { screen } from '../Constants';
import { MainStackParamList } from '../navigations/StackNavigation';
import { RootTabNavigationProp } from '../navigations/TabNavigation';

type KakaoWebtoonRouteProp = RouteProp<RootTabNavigationProp, 'KakaoWebtoon'>;

type KakaoWebtoonNavigationProp = CompositeNavigationProp<
    StackNavigationProp<MainStackParamList, 'Tab'>,
    BottomTabNavigationProp<RootTabNavigationProp, 'KakaoWebtoon'>
>;

type KakaoWebtoonProps = {
    route: KakaoWebtoonRouteProp;
    navigation: KakaoWebtoonNavigationProp;
};

export default ({ navigation }: KakaoWebtoonProps) => {
    return (
        <CircularScrollView
            style={{ flex: 1 }}
            data={dataWithSpare}
            itemHeight={200}
            renderItem={({ item, index }) => {
                return (
                    <TouchableWithoutFeedback
                        onPress={() =>
                            navigation.navigate('WebtoonDetail', {
                                image: `${item.color}${index}`,
                            })
                        }>
                        <View
                            style={{
                                width: screen.width,
                                height: 200,
                                backgroundColor: item.color,
                            }}>
                            <SharedElement id={`${item.color}${index}`}>
                                <Text>{index}</Text>
                            </SharedElement>
                        </View>
                    </TouchableWithoutFeedback>
                );
            }}
        />
    );
};
