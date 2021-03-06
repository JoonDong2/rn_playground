import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, StyleProp, TouchableOpacity, ViewStyle } from 'react-native';
import Animated, {
    SharedValue,
    useAnimatedStyle,
} from 'react-native-reanimated';
import { Socket } from 'socket.io-client';
import { mediaDevices, RTCPeerConnection, RTCView } from 'react-native-webrtc';
import { isAndroid, screen } from '../Constants';

interface ZoomModalProps {
    socket: Socket;
    roomName: string;
    type: 'owner' | 'visitor';
    ownerName: string;
    closeChatModal: (local?: boolean) => void;
    modalTop: SharedValue<number>;
    modalMinifiedTop: number;
    modalAppearing: SharedValue<boolean>;
    style?: StyleProp<Animated.AnimateStyle<StyleProp<ViewStyle>>>;
}

const MINIFIED_MODAL_HEIGHT = 60;
const MINIFIED_VIDEO_WIDTH = (MINIFIED_MODAL_HEIGHT * 16) / 9;
const MINIFIED_VIDEO_HEIGHT = (MINIFIED_VIDEO_WIDTH * 16) / 9;
const ETC_WIDTH = screen.width - MINIFIED_VIDEO_WIDTH;

export default ({
    socket,
    roomName,
    type,
    ownerName,
    closeChatModal,
    modalTop,
    modalMinifiedTop,
    modalAppearing,
    style,
}: ZoomModalProps) => {
    const [peerStream, setPeerStream] = useState<any>(null);

    const myPeerConnectionRef = useRef<any>(null);

    const handleIcecandidate = useCallback(
        e => {
            socket.emit('icecandidate', {
                icecandidate: e.candidate,
                roomName,
            });
        },
        [roomName, socket],
    );

    const handleAddStream = useCallback(e => {
        setPeerStream(e.stream);
    }, []);

    const removeMyPeerConnctionEventListener = useCallback(() => {
        myPeerConnectionRef.current.removeEventListener(
            'icecandidate',
            handleIcecandidate,
        );
        myPeerConnectionRef.current.removeEventListener(
            'addstream',
            handleAddStream,
        );
        myPeerConnectionRef.current.removeEventListener(
            'connectionstatechange',
            onConnectionStateChange,
        );
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [handleAddStream, handleIcecandidate]);

    const onConnectionStateChange = useCallback(() => {
        if (!myPeerConnectionRef.current) return;

        const state = myPeerConnectionRef.current.connectionState;
        // ????????? ????????? ???
        if (state === 'connected') {
            socket.disconnect();
        }
        // ????????? ????????? ???
        else if (state === 'disconnected') {
            Alert.alert('??????', '???????????? ???????????????.');
            removeMyPeerConnctionEventListener();
            myPeerConnectionRef.current.close();
            closeChatModal(true);
        }
        // ????????? ???????????? ???
        if (state === 'failed') {
            removeMyPeerConnctionEventListener();
            myPeerConnectionRef.current.close();
            closeChatModal(true);
        }
    }, [closeChatModal, removeMyPeerConnctionEventListener, socket]);

    useEffect(() => {
        (async () => {
            // ?????????1: ????????? ??? ????????? ????????? ??????
            const sourceInfos = await mediaDevices.enumerateDevices();
            const videoSourceInfo = sourceInfos.filter(
                (sourceInfo: any) =>
                    sourceInfo.kind === 'videoinput' &&
                    sourceInfo.facing === 'front',
            );

            if (videoSourceInfo.length === 0) {
                Alert.alert('??????', '????????? ???????????? ???????????? ???????????????.');
                socket.disconnect();
                closeChatModal();
                return;
            }

            const stream = await mediaDevices.getUserMedia({
                audio: true,
                video: {
                    frameRate: 30,
                    facingMode: 'user',
                    deviceId: videoSourceInfo.id,
                },
            });

            if (!stream) {
                Alert.alert('??????', '????????? ???????????? ???????????? ???????????????.');
                closeChatModal();
                return;
            }

            const myPeerConnection = new RTCPeerConnection({
                iceServers: [
                    {
                        urls: [
                            'stun:stun.l.google.com:19302',
                            'stun:stun1.l.google.com:19302',
                            'stun:stun2.l.google.com:19302',
                            'stun:stun3.l.google.com:19302',
                            'stun:stun4.l.google.com:19302',
                        ],
                    },
                ],
            });
            if (!myPeerConnection) {
                Alert.alert('??????', '???????????? ????????? ??????????????????.');
                closeChatModal();
                return;
            }

            myPeerConnection.onicecandidate = handleIcecandidate;
            myPeerConnection.onaddstream = handleAddStream;
            myPeerConnection.onconnectionstatechange = onConnectionStateChange;

            myPeerConnection.addStream(stream);

            myPeerConnectionRef.current = myPeerConnection;

            socket.on('offer', async offer => {
                // ???????????? offer??? ?????? PeerConnection??? ????????????.
                myPeerConnection.setRemoteDescription(offer);

                // answer ??????
                const answer = await myPeerConnection.createAnswer();

                // ????????? ?????? answer??? ?????? PeerConnection??? ????????????.
                myPeerConnection.setLocalDescription(answer);

                // ?????? answer??? ??????????????? ????????????.
                socket.emit('answer', { answer, roomName });
            });

            socket.on('answer', answer => {
                myPeerConnection.setRemoteDescription(answer);
            });

            socket.on('icecandidate', icecandidate => {
                if (!icecandidate) return;
                myPeerConnection.addIceCandidate(icecandidate);
            });

            if (type === 'owner') return;
            const offer = await myPeerConnection.createOffer();
            myPeerConnection.setLocalDescription(offer);
            socket.emit('offer', { offer, roomName });
        })();

        return () => {
            socket.disconnect();
            removeMyPeerConnctionEventListener();
            myPeerConnectionRef.current.close();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const videoContainerStyle = useAnimatedStyle(() => ({
        width: modalAppearing.value
            ? screen.width
            : MINIFIED_VIDEO_WIDTH +
              (screen.width * (modalMinifiedTop - modalTop.value)) /
                  (modalMinifiedTop * 0.3),
    }));

    const etcContainerStyle = useAnimatedStyle(() => ({
        opacity:
            (modalTop.value - modalMinifiedTop * 0.7) /
            (modalMinifiedTop * 0.3),
    }));

    return (
        <Animated.View
            style={[
                style,
                {
                    flex: 1,
                    flexDirection: 'row',
                    flexWrap: 'nowrap',
                    backgroundColor: '#ffffff',
                },
            ]}>
            <Animated.View
                style={[
                    {
                        minWidth: MINIFIED_VIDEO_WIDTH,
                        maxWidth: screen.width,
                        backgroundColor: '#000000',
                        height: '100%',
                        justifyContent: 'center',
                        alignItems: 'center',
                        overflow: 'hidden',
                    },
                    videoContainerStyle,
                ]}>
                {peerStream ? (
                    <RTCView
                        style={{
                            flex: 1,
                            width: '100%',
                            minHeight: MINIFIED_VIDEO_HEIGHT,
                        }}
                        streamURL={peerStream.toURL()}
                        objectFit="contain"
                    />
                ) : (
                    <Animated.Text
                        style={{
                            color: '#ffffff',
                        }}>
                        ???????????? ???????????? ????????????.
                    </Animated.Text>
                )}
            </Animated.View>
            <Animated.View
                style={[
                    {
                        width: ETC_WIDTH,
                        height: MINIFIED_MODAL_HEIGHT,
                        flexDirection: 'row',
                        justifyContent: 'flex-end',
                        alignItems: 'center',
                        backgroundColor: '#ffffff',
                    },
                    etcContainerStyle,
                ]}>
                <Animated.Text
                    numberOfLines={1}
                    ellipsizeMode="tail">{`${ownerName}?????? ?????? ???: ${roomName}`}</Animated.Text>
                <TouchableOpacity
                    onPress={() => {
                        socket.disconnect();
                        myPeerConnectionRef.current?.close();
                        closeChatModal(true);
                    }}
                    style={{
                        width: MINIFIED_MODAL_HEIGHT - 20,
                        height: MINIFIED_MODAL_HEIGHT,
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}>
                    <Animated.Text
                        style={{
                            fontSize: 20,
                            includeFontPadding: false,
                        }}>
                        X
                    </Animated.Text>
                </TouchableOpacity>
            </Animated.View>
        </Animated.View>
    );
};
