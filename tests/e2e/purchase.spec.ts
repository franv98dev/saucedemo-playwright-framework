import { buildCustomer } from '@data/customer';
import { ORDER_COMPLETE_HEADER, PAGE_TITLES } from '@data/messages';
import { PRODUCTS } from '@data/products';
import { USERS } from '@data/users';
import { expect, LOGGED_OUT, test } from '@fixtures/test';
import { calculateOrderSummary } from '@utils/price';

test.use(LOGGED_OUT);

test(
  'customer can buy products from login to order confirmation',
  { tag: ['@smoke', '@e2e'] },
  async ({
    loginPage,
    inventoryPage,
    cartPage,
    checkoutInformationPage,
    checkoutOverviewPage,
    checkoutCompletePage,
  }) => {
    const products = [PRODUCTS.backpack, PRODUCTS.boltTShirt];
    const customer = buildCustomer();

    await test.step('log in', async () => {
      await loginPage.goto();
      await loginPage.login(USERS.standard);
      await inventoryPage.expectToBeOpen();
    });

    await test.step('add products to the cart', async () => {
      await inventoryPage.sortBy('lohi');
      await inventoryPage.addToCart(...products);
      await inventoryPage.header.expectCartCount(products.length);
    });

    await test.step('review the cart', async () => {
      await inventoryPage.header.openCart();
      await expect(cartPage.itemNames).toHaveText(products.map((p) => p.name));
      await cartPage.checkout();
    });

    await test.step('enter customer information', async () => {
      await expect(checkoutInformationPage.title).toHaveText(PAGE_TITLES.checkoutInfo);
      await checkoutInformationPage.submit(customer);
    });

    await test.step('verify the order summary', async () => {
      await expect(checkoutOverviewPage.title).toHaveText(PAGE_TITLES.checkoutOverview);
      const expected = calculateOrderSummary(products.map((p) => p.price));
      expect(await checkoutOverviewPage.getSummary()).toEqual(expected);
      await checkoutOverviewPage.finish();
    });

    await test.step('see the confirmation and an empty cart', async () => {
      await checkoutCompletePage.expectToBeOpen();
      await expect(checkoutCompletePage.title).toHaveText(PAGE_TITLES.checkoutComplete);
      await expect(checkoutCompletePage.completeHeader).toHaveText(ORDER_COMPLETE_HEADER);
      await checkoutCompletePage.header.expectCartCount(0);
    });

    await test.step('go back to the products', async () => {
      await checkoutCompletePage.backHome();
      await inventoryPage.expectToBeOpen();
      await expect(inventoryPage.addToCartButton(PRODUCTS.backpack)).toBeVisible();
    });
  },
);
