import { expect, type Locator, type Page } from '@playwright/test';

import { HeaderComponent } from './components/HeaderComponent';

/**
 * Shared behaviour for every page behind the login.
 * Page objects expose intent-revealing actions and a small set of `expect*` helpers;
 * specs remain responsible for the business assertions.
 */
export abstract class BasePage {
  /** Relative URL of the page, resolved against `baseURL`. */
  abstract readonly path: string;

  readonly header: HeaderComponent;
  readonly title: Locator;

  constructor(readonly page: Page) {
    this.header = new HeaderComponent(page);
    this.title = page.getByTestId('title');
  }

  async goto(): Promise<void> {
    await this.page.goto(this.path);
  }

  async expectToBeOpen(): Promise<void> {
    await expect(this.page).toHaveURL(new RegExp(`${escapeRegExp(this.path)}$`));
  }
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
