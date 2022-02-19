import React from 'react';
import { Text, View } from 'react-native';
import CircularScrollView from '../components/CircularScrollView';
import { overflowData } from '../components/CircularScrollView/testData';
import { screen } from '../Constants';

export default () => {
    return (
        <CircularScrollView
            style={{ flex: 1 }}
            data={overflowData}
            itemHeight={200}
            renderItem={({ item, index }) => {
                return (
                    <View
                        style={{
                            width: screen.width,
                            height: 200,
                            backgroundColor: item.color,
                        }}>
                        <Text>{index}</Text>
                    </View>
                );
            }}
        />
    );
};
