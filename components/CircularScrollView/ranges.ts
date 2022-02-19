export const circulateScrollTop = ({
    scrollTop,
    height,
    contentsHeight,
}: {
    scrollTop: number;
    height: number;
    contentsHeight: number;
}) => {
    'worklet';
    if (
        (scrollTop > 0 && scrollTop <= contentsHeight) ||
        (scrollTop < 0 && scrollTop >= -contentsHeight)
    )
        return scrollTop;
    if (scrollTop < 0) {
        return height + (scrollTop % contentsHeight);
    } else if (scrollTop > 0) {
        return -(
            contentsHeight -
            height -
            ((scrollTop - height) % contentsHeight)
        );
    }
    return scrollTop;
};

export const calculateFirstIndex = ({
    scrollTop,
    height,
    contentsHeight,
    itemHeight,
    itemLength,
}: {
    scrollTop: number;
    height: number;
    contentsHeight: number;
    itemHeight: number;
    itemLength: number;
}) => {
    'worklet';
    const pureScrollTop = circulateScrollTop({
        scrollTop,
        height: height,
        contentsHeight,
    });

    const pureIndex = Math.floor(-pureScrollTop / itemHeight);

    if (pureIndex < 0) return pureIndex + itemLength;
    return pureIndex;
};
