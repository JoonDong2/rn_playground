import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React from 'react';
import { TouchableWithoutFeedback } from 'react-native';
import Animated from 'react-native-reanimated';
import { SharedElement } from 'react-navigation-shared-element';
import CircularScrollView from '../components/CircularScrollView';
import {
    overflowData,
    dataWithSpare,
} from '../components/CircularScrollView/testData';
import { screen } from '../Constants';
import { MainStackParamList } from '../navigations/StackNavigation';

type TabStackNavigationProp = StackNavigationProp<MainStackParamList, 'Tab'>;

export default () => {
    const navigation = useNavigation<TabStackNavigationProp>();
    return (
        <CircularScrollView
            style={{ flex: 1 }}
            data={overflowData}
            itemHeight={300}
            renderItem={({ item, index }) => {
                return (
                    <TouchableWithoutFeedback
                        onPress={() =>
                            navigation.navigate('WebtoonDetail', {
                                image: `${item.color}${index}`,
                            })
                        }>
                        <Animated.View
                            style={{
                                width: screen.width,
                                height: 300,
                                backgroundColor: item.color,
                            }}>
                            <SharedElement id={`${item.color}${index}`}>
                                <Animated.Text>{index}</Animated.Text>
                            </SharedElement>
                        </Animated.View>
                    </TouchableWithoutFeedback>
                );
            }}
        />
    );
};
