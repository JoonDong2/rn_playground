describe('Example', () => {
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
        await element(by.text('hello')).tap();
        // await element(by.id('hello')).tap(); // 인식 x
    });

    // it('should show world screen after tap', async () => {
    //   await element(by.id('world_button')).tap();
    //   await expect(element(by.text('World!!!'))).toBeVisible();
    // });
});
