import React from 'react';
import { View } from 'react-native';

interface ItemContainerProps {
    children: React.ReactElement[];
}

export default ({ children }: ItemContainerProps) => {
    return <View>{children}</View>;
};
