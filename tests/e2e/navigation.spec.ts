import { PRODUCTS } from '@data/products';
import { expect, test } from '@fixtures/test';

test.describe('Side menu and navigation', () => {
  test.beforeEach(async ({ inventoryPage }) => {
    await inventoryPage.goto();
  });

  test('menu opens and closes', { tag: ['@regression'] }, async ({ inventoryPage }) => {
    await inventoryPage.header.openMenu();
    await expect(inventoryPage.header.logoutLink).toBeVisible();

    await inventoryPage.header.closeMenu();
    await expect(inventoryPage.header.logoutLink).toBeHidden();
  });

  test(
    '"All Items" navigates back to the inventory',
    { tag: ['@regression'] },
    async ({ inventoryPage, cartPage }) => {
      await inventoryPage.header.openCart();
      await cartPage.expectToBeOpen();

      await cartPage.header.goToAllItems();

      await inventoryPage.expectToBeOpen();
    },
  );

  test(
    '"About" links to the Sauce Labs website',
    { tag: ['@regression'] },
    async ({ inventoryPage }) => {
      await inventoryPage.header.openMenu();

      await expect(inventoryPage.header.aboutLink).toHaveAttribute(
        'href',
        'https://saucelabs.com/',
      );
    },
  );

  test(
    '"Reset App State" empties the cart',
    { tag: ['@regression'] },
    async ({ inventoryPage, cartPage }) => {
      await inventoryPage.addToCart(PRODUCTS.backpack, PRODUCTS.onesie);

      await inventoryPage.header.resetAppState();

      await inventoryPage.header.expectCartCount(0);
      await cartPage.goto();
      await expect(cartPage.items).toHaveCount(0);
    },
  );

  test('cart icon opens the cart', { tag: ['@smoke'] }, async ({ inventoryPage, cartPage }) => {
    await inventoryPage.header.openCart();

    await cartPage.expectToBeOpen();
  });

  test('footer shows the social links', { tag: ['@regression'] }, async ({ page }) => {
    const footer = page.getByTestId('footer');

    await expect(footer.getByTestId('social-x')).toHaveAttribute('href', /x\.com|twitter\.com/);
    await expect(footer.getByTestId('social-facebook')).toHaveAttribute('href', /facebook\.com/);
    await expect(footer.getByTestId('social-linkedin')).toHaveAttribute('href', /linkedin\.com/);
  });
});
