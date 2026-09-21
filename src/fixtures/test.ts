import AxeBuilder from '@axe-core/playwright';
import { test as base } from '@playwright/test';

import { type Product } from '../data/products';
import { CartPage } from '../pages/CartPage';
import { CheckoutCompletePage } from '../pages/CheckoutCompletePage';
import { CheckoutInformationPage } from '../pages/CheckoutInformationPage';
import { CheckoutOverviewPage } from '../pages/CheckoutOverviewPage';
import { InventoryPage } from '../pages/InventoryPage';
import { LoginPage } from '../pages/LoginPage';
import { ProductDetailsPage } from '../pages/ProductDetailsPage';

interface PageFixtures {
  loginPage: LoginPage;
  inventoryPage: InventoryPage;
  productDetailsPage: ProductDetailsPage;
  cartPage: CartPage;
  checkoutInformationPage: CheckoutInformationPage;
  checkoutOverviewPage: CheckoutOverviewPage;
  checkoutCompletePage: CheckoutCompletePage;
}

interface HelperFixtures {
  /**
   * Puts products in the cart by writing the app's `cart-contents` localStorage key
   * before any page script runs. Much faster and less brittle than clicking through
   * the UI when the cart is a precondition rather than the behaviour under test.
   */
  seedCart: (...products: Product[]) => Promise<void>;
  /** Pre-configured axe-core scanner (WCAG 2.1 A/AA rules). */
  makeAxeBuilder: () => AxeBuilder;
}

export const test = base.extend<PageFixtures & HelperFixtures>({
  loginPage: async ({ page }, use) => use(new LoginPage(page)),
  inventoryPage: async ({ page }, use) => use(new InventoryPage(page)),
  productDetailsPage: async ({ page }, use) => use(new ProductDetailsPage(page)),
  cartPage: async ({ page }, use) => use(new CartPage(page)),
  checkoutInformationPage: async ({ page }, use) => use(new CheckoutInformationPage(page)),
  checkoutOverviewPage: async ({ page }, use) => use(new CheckoutOverviewPage(page)),
  checkoutCompletePage: async ({ page }, use) => use(new CheckoutCompletePage(page)),

  seedCart: async ({ page }, use) => {
    await use(async (...products: Product[]) => {
      const ids = JSON.stringify(products.map((product) => product.id));
      await page.addInitScript((value) => {
        // Init scripts run on every navigation: seed only once per tab so that
        // later add/remove actions made by the test are not overwritten.
        if (window.sessionStorage.getItem('cart-seeded')) return;
        window.localStorage.setItem('cart-contents', value);
        window.sessionStorage.setItem('cart-seeded', 'true');
      }, ids);
    });
  },

  makeAxeBuilder: async ({ page }, use) => {
    await use(() =>
      new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']),
    );
  },
});

/** Use in `test.use()` to start a spec without the stored session. */
export const LOGGED_OUT = { storageState: { cookies: [], origins: [] } };

export { expect } from '@playwright/test';
