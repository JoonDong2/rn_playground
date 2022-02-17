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
        (scrollTop > 0 && scrollTop < contentsHeight) ||
        (scrollTop < 0 && scrollTop > -contentsHeight)
    )
        return scrollTop;
    if (scrollTop < 0) {
        return height + (scrollTop % contentsHeight);
    } else if (scrollTop > 0) {
        return -((scrollTop - height) % contentsHeight);
    }
    return scrollTop;
};
