import { expect, type Locator, type Page } from '@playwright/test';

import { PASSWORD } from '../data/users';

export class LoginPage {
  readonly path = '/';

  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;
  readonly dismissErrorButton: Locator;

  constructor(readonly page: Page) {
    this.usernameInput = page.getByTestId('username');
    this.passwordInput = page.getByTestId('password');
    this.loginButton = page.getByTestId('login-button');
    this.errorMessage = page.getByTestId('error');
    this.dismissErrorButton = page.getByTestId('error-button');
  }

  async goto(): Promise<void> {
    await this.page.goto(this.path);
  }

  async login(username: string, password: string = PASSWORD): Promise<void> {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async expectToBeOpen(): Promise<void> {
    await expect(this.loginButton).toBeVisible();
  }

  async expectError(message: string): Promise<void> {
    await expect(this.errorMessage).toHaveText(message);
  }

  async dismissError(): Promise<void> {
    await this.dismissErrorButton.click();
    await expect(this.errorMessage).toBeHidden();
  }
}
