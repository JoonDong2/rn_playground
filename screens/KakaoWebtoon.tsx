import React from 'react';
import { Text, View } from 'react-native';
import CircularScrollView from '../components/CircularScrollView';
import { screen } from '../Constants';

export default () => {
    return <CircularScrollView style={{ flex: 1 }} data={[{color: 'red'}, {color: 'blue'}, {color: 'green'}, {color: 'yellow'}, {color: 'purple'}, {color: 'skyblue'}]} itemHeight={200} renderItem={({item, index}) => {
        console.log("여기")
        return <View style={{width: screen.width, height: 200, backgroundColor: item.color}}>
            <Text>{index}</Text>
        </View>
    }}/>;
};
