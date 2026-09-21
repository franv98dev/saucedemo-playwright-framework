import { expect, test as setup } from '@playwright/test';

import { LoginPage } from '../src/pages/LoginPage';
import { STORAGE_STATE, USERS } from '../src/data/users';

/** SauceDemo's session cookie lasts only 10 minutes; a full cross-browser run can take longer. */
const SESSION_TTL_SECONDS = 2 * 60 * 60;

/**
 * Authenticates once through the UI and saves cookies + localStorage.
 * Every browser project reuses this state, so specs that are not about login
 * skip the login screen entirely.
 */
setup('authenticate as standard_user', async ({ page }) => {
  const loginPage = new LoginPage(page);

  await loginPage.goto();
  await loginPage.login(USERS.standard);
  await expect(page).toHaveURL(/\/inventory\.html$/);

  const state = await page.context().storageState();
  const sessionCookie = state.cookies.find((cookie) => cookie.name === 'session-username');
  expect(sessionCookie, 'session cookie should be set after login').toBeDefined();

  // Extend the session so tests that start late in a long run are still authenticated.
  const expires = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
  await page.context().addCookies([{ ...sessionCookie!, expires }]);
  await page.context().storageState({ path: STORAGE_STATE });
});
