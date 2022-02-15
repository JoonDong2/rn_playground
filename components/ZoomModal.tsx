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
        // 연결이 되었을 때
        if (state === 'connected') {
            socket.disconnect();
        }
        // 연결이 끊겼을 때
        else if (state === 'disconnected') {
            Alert.alert('오류', '상대방이 나갔습니다.');
            removeMyPeerConnctionEventListener();
            myPeerConnectionRef.current.close();
            closeChatModal(true);
        }
        // 연결에 실패했을 때
        if (state === 'failed') {
            removeMyPeerConnctionEventListener();
            myPeerConnectionRef.current.close();
            closeChatModal(true);
        }
    }, [closeChatModal, removeMyPeerConnctionEventListener, socket]);

    useEffect(() => {
        (async () => {
            // 초기화1: 비디오 및 오디오 스트림 얻기
            const sourceInfos = await mediaDevices.enumerateDevices();
            const videoSourceInfo = sourceInfos.filter(
                (sourceInfo: any) =>
                    sourceInfo.kind === 'videoinput' &&
                    sourceInfo.facing === 'front',
            );

            if (videoSourceInfo.length === 0) {
                Alert.alert('오류', '비디오 스트림을 얻어오지 못했습니다.');
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
                Alert.alert('오류', '비디오 스트림을 얻어오지 못했습니다.');
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
                Alert.alert('오류', '상대방과 연결에 실패했습니다.');
                closeChatModal();
                return;
            }

            myPeerConnection.onicecandidate = handleIcecandidate;
            myPeerConnection.onaddstream = handleAddStream;
            myPeerConnection.onconnectionstatechange = onConnectionStateChange;

            if (isAndroid) console.log(type, '나의 스트림 추가');
            myPeerConnection.addStream(stream);

            myPeerConnectionRef.current = myPeerConnection;

            socket.on('offer', async offer => {
                // if (isAndroid) console.log(type, 'offer 수신');
                // 상대방의 offer를 나의 PeerConnection에 저장한다.
                myPeerConnection.setRemoteDescription(offer);

                // answer 생성
                const answer = await myPeerConnection.createAnswer();

                // 생성된 나의 answer를 나의 PeerConnection에 저장한다.
                myPeerConnection.setLocalDescription(answer);

                // 나의 answer를 상대방에게 전달한다.
                socket.emit('answer', { answer, roomName });
                // if (isAndroid) console.log(type, 'answer 전송');
            });

            socket.on('answer', answer => {
                // if (isAndroid) console.log(type, 'answer 수신');
                myPeerConnection.setRemoteDescription(answer);
            });

            socket.on('icecandidate', icecandidate => {
                if (!icecandidate) return;
                // if (isAndroid) console.log(type, 'icecandidate 수신');
                myPeerConnection.addIceCandidate(icecandidate);
            });

            if (type === 'owner') return;
            const offer = await myPeerConnection.createOffer();
            myPeerConnection.setLocalDescription(offer);
            socket.emit('offer', { offer, roomName });
            if (isAndroid) console.log(type, 'offer 전송');
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
                        상대방을 기다리고 있습니다.
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
                    ellipsizeMode="tail">{`${ownerName}님이 만든 방: ${roomName}`}</Animated.Text>
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
