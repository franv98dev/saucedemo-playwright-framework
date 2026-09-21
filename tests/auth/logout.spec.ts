import { LOGIN_ERRORS } from '@data/messages';
import { expect, test } from '@fixtures/test';

test.describe('Logout', () => {
  test.beforeEach(async ({ inventoryPage }) => {
    await inventoryPage.goto();
  });

  test(
    'user can log out from the side menu',
    { tag: ['@smoke'] },
    async ({ page, inventoryPage, loginPage }) => {
      await inventoryPage.header.logout();

      await loginPage.expectToBeOpen();
      await expect(page).toHaveURL(/\/$/);
    },
  );

  test(
    'session cookie is removed after logout',
    { tag: ['@regression'] },
    async ({ page, inventoryPage }) => {
      await inventoryPage.header.logout();

      const cookies = await page.context().cookies();
      expect(cookies.find((cookie) => cookie.name === 'session-username')).toBeUndefined();
    },
  );

  test(
    'protected pages are not reachable after logout',
    { tag: ['@regression'] },
    async ({ page, inventoryPage, loginPage }) => {
      await inventoryPage.header.logout();
      await page.goBack();
      await page.reload();

      await loginPage.expectError(LOGIN_ERRORS.notLoggedIn('/inventory.html'));
    },
  );
});
