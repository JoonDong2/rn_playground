import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, StyleProp, ViewStyle } from 'react-native';
import Animated, { SharedValue } from 'react-native-reanimated';
import { Socket } from 'socket.io-client';
import { mediaDevices, RTCPeerConnection, RTCView } from 'react-native-webrtc';
import { isAndroid, screen } from '../Constants';

interface ZoomModalProps {
    socket: Socket;
    roomName: string;
    type: 'owner' | 'visitor';
    closeChatModal: (local?: boolean) => void;
    modalTop: SharedValue<number>;
    modalHeight: SharedValue<number>;
    modalMaxHeight: number;
    modalMinifiedTop: number;
    style?: StyleProp<Animated.AnimateStyle<StyleProp<ViewStyle>>>;
}

export default ({
    socket,
    roomName,
    type,
    closeChatModal,
    modalTop,
    modalHeight,
    modalMaxHeight,
    modalMinifiedTop,
    style,
}: ZoomModalProps) => {
    const [peerStream, setPeerStream] = useState<any>(null);

    const myPeerConnectionRef = useRef<any>(null);

    const handleIcecandidate = useCallback(
        e => {
            // if (isAndroid) console.log(type, 'icecandidate 전송', e);
            socket.emit('icecandidate', {
                icecandidate: e.candidate,
                roomName,
            });
        },
        [roomName, socket, type],
    );

    const handleAddStream = useCallback(
        e => {
            console.log(type, '상대방 스트림 수신');
            setPeerStream(e.stream);
        },
        [type],
    );

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

            // myPeerConnection.addEventListener(
            //     'icecandidate',
            //     handleIcecandidate,
            // );
            // myPeerConnection.addEventListener('addstream', handleAddStream);

            myPeerConnection.onicecandidate = handleIcecandidate;

            myPeerConnection.onaddstream = handleAddStream;

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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <Animated.View
            style={[
                style,
                {
                    flex: 1,
                    backgroundColor: 'green',
                    opacity: 0.5,
                    justifyContent: 'center',
                    alignItems: 'center',
                },
            ]}>
            {peerStream && (
                <RTCView style={{flex: 1, width: screen.width}} streamURL={peerStream.toURL()} objectFit="contain" />
            )}
        </Animated.View>
    );
};
