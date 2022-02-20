import React from 'react';
import Svg, { Polygon } from 'react-native-svg';

interface LeftCoverProps {
    direction: 'left' | 'right';
    odd: boolean;
    width: number;
    height: number;
    isDetail?: boolean;
}

export default ({
    direction,
    odd,
    width,
    height,
    isDetail,
}: LeftCoverProps) => {
    return (
        <Svg
            style={{
                transform: [
                    {
                        translateX: isDetail
                            ? direction === 'left'
                                ? -width
                                : width
                            : 0,
                    },
                ],
            }}
            width={width}
            height={height}>
            <Polygon
                points={
                    direction === 'left'
                        ? odd
                            ? `0,0 ${width},0 ${
                                  width * 0.4
                              },${height} 0,${height}`
                            : `0,0 ${
                                  width * 0.4
                              },0 ${width},${height} 0,${height}`
                        : odd
                        ? `${width * 0.8},0 ${width},0 ${width},${height} ${
                              width * 0.2
                          },${height}`
                        : `${width * 0.2},0 ${width},0 ${width},${height} ${
                              width * 0.8
                          },${height}`
                }
                fill="#000000"
                strokeWidth="0"
            />
        </Svg>
    );
};
