import { LOGIN_ERRORS } from '@data/messages';
import { PASSWORD, USERS } from '@data/users';
import { expect, LOGGED_OUT, test } from '@fixtures/test';

test.use(LOGGED_OUT);

test.describe('Login', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
  });

  test(
    'standard user can log in and lands on the inventory',
    { tag: ['@smoke'] },
    async ({ loginPage, inventoryPage }) => {
      await loginPage.login(USERS.standard);

      await inventoryPage.expectToBeOpen();
      await expect(inventoryPage.title).toHaveText('Products');
    },
  );

  const invalidLogins = [
    {
      case: 'empty username',
      username: '',
      password: PASSWORD,
      error: LOGIN_ERRORS.usernameRequired,
    },
    {
      case: 'empty password',
      username: USERS.standard,
      password: '',
      error: LOGIN_ERRORS.passwordRequired,
    },
    { case: 'both fields empty', username: '', password: '', error: LOGIN_ERRORS.usernameRequired },
    {
      case: 'wrong password',
      username: USERS.standard,
      password: 'wrong_password',
      error: LOGIN_ERRORS.invalidCredentials,
    },
    {
      case: 'unknown user',
      username: 'unknown_user',
      password: PASSWORD,
      error: LOGIN_ERRORS.invalidCredentials,
    },
    {
      case: 'username with different case',
      username: 'Standard_User',
      password: PASSWORD,
      error: LOGIN_ERRORS.invalidCredentials,
    },
    {
      case: 'locked out user',
      username: USERS.lockedOut,
      password: PASSWORD,
      error: LOGIN_ERRORS.lockedOut,
    },
  ];

  for (const { case: scenario, username, password, error } of invalidLogins) {
    test(
      `shows an error for ${scenario}`,
      { tag: ['@regression'] },
      async ({ page, loginPage }) => {
        await loginPage.login(username, password);

        await loginPage.expectError(error);
        await expect(page).toHaveURL(/\/$/);
      },
    );
  }

  test('error message can be dismissed', { tag: ['@regression'] }, async ({ loginPage }) => {
    await loginPage.login('', '');
    await loginPage.expectError(LOGIN_ERRORS.usernameRequired);

    await loginPage.dismissError();
  });

  test('password field masks its input', { tag: ['@regression'] }, async ({ loginPage }) => {
    await expect(loginPage.passwordInput).toHaveAttribute('type', 'password');
  });

  test(
    'user can log in by pressing Enter',
    { tag: ['@regression'] },
    async ({ loginPage, inventoryPage }) => {
      await loginPage.usernameInput.fill(USERS.standard);
      await loginPage.passwordInput.fill(PASSWORD);
      await loginPage.passwordInput.press('Enter');

      await inventoryPage.expectToBeOpen();
    },
  );
});

test.describe('Access control', () => {
  const protectedPaths = [
    '/inventory.html',
    '/inventory-item.html',
    '/cart.html',
    '/checkout-step-one.html',
    '/checkout-step-two.html',
    '/checkout-complete.html',
  ];

  for (const path of protectedPaths) {
    test(
      `anonymous user is redirected to login from ${path}`,
      { tag: ['@regression'] },
      async ({ page, loginPage }) => {
        await page.goto(path);

        await expect(page).toHaveURL(/\/$/);
        await loginPage.expectError(LOGIN_ERRORS.notLoggedIn(path));
      },
    );
  }
});
