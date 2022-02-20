## Zoom + YouTube 클론
* NestJS로 간단히 만든 [joom-server](https://github.com/JoonDong2/joom-server)로 피어간 WebRTC 연결 중개
* 중개서버는 피어간 연결을 중개하고 바로 연결 해제되고, 이후 WebRTC를 통해 **피어간 비디오 및 오디오 스트림 통신**
* 리스트를 아래로 당겨서 리스트 새로고침
* 비디오 Modal을 아래로 당겨서 최소화 가능
* 최소화 상태의 비디오 Modal을 위로 당겨서 최대화 가능
* 최소화 상태의 비디오 Modal을 아래로 당겨서 방 나가기 가능 
* 모달을 최대화/최소화할 때 Bottom 탭바가 아래 위로 이동 
* **실제 디바이스에서만** 테스트 가능 (`XCode > Target > rn_playground > Signing & Capabilities`에서 Team 설정 필요)

## 카카오 웹툰 클론
* 위아래 무한 순환 스크롤
* 참조: [react-native-virtualized-waterfall](https://github.com/fengbujue2022/react-native-waterfall)
* react-native-reanimated V2를 사용해서 구현
* 아이템, 상세화면 전환간 Shared Transition 적용
* 한 번 순환할 때마다 깜빡이는 현상이 발생 (수정중.. scrollTop을 순환시킬 때 아이템의 top 값이 순간적으로 튀는 현상)
* 성능 문제 (버퍼에 비례하여 성능 저하 발생)

## e2e 테스트
* 카카오 웹툰 클론 Shared Transition 테스트
* Zoom 클론 방 생성 테스트

detox-cli 설치
```
$ xcode-select --install
$ brew tap wix/brew
$ brew install applesimutils
$ npm install -g detox-cli
```
빌드 후 테스트
```
$ detox build -c ios // 빌드 후에만 테스트 가능
$ detox text -c ios

$ detox build -c android
$ detox text -c android
```

#### 개발환경
* 인텔 맥북 Mac OS: 11.6.1
* 아이폰 6S iOS 15.1
* 안드로이드 LG G7 (안드로이드110), 갤럭시 A32(안드로이드 11)