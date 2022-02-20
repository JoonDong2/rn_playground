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
        await element(by.text('카카오웹툰 클론')).tap();
        await element(by.text('제목2')).tap();
        await element(by.id('DetailImage')).tap();
    });

    // it('should show world screen after tap', async () => {
    //   await element(by.id('world_button')).tap();
    //   await expect(element(by.text('World!!!'))).toBeVisible();
    // });
});
