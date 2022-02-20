describe('Shared Transition', () => {
    beforeAll(async () => {
        await device.launchApp();
    });

    // beforeEach(async () => {
    //   await device.reloadReactNative();
    // });

    // it('should have welcome screen', async () => {
    //   await expect(element(by.id('welcome'))).toBeVisible();
    // });

    it('should show hello screen after tap', async () => {
        await element(by.text('+')).tap();
        await waitFor(element(by.id('NicknameInput'))).toBeVisible().withTimeout(2000);
        await element(by.id('NicknameInput')).typeText('아저씨');
        await element(by.id('RoomNameInput')).typeText('안녕하세요');
        await element(by.id('PasswordInput')).typeText('123');
        await element(by.text('방 생성')).tap();
        await waitFor(element(by.text('상대방을 기다리고 있습니다.'))).toBeVisible().withTimeout(5000);
    });
});
