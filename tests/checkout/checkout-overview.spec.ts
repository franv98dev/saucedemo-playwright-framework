import { buildCustomer } from '@data/customer';
import { PAGE_TITLES } from '@data/messages';
import { ALL_PRODUCTS, type Product, PRODUCTS } from '@data/products';
import { expect, test } from '@fixtures/test';
import { calculateOrderSummary } from '@utils/price';

test.describe('Checkout: overview', () => {
  const carts: { name: string; products: Product[] }[] = [
    { name: 'a single item', products: [PRODUCTS.backpack] },
    { name: 'the cheapest item', products: [PRODUCTS.onesie] },
    { name: 'two items', products: [PRODUCTS.bikeLight, PRODUCTS.fleeceJacket] },
    { name: 'the whole catalog', products: [...ALL_PRODUCTS] },
  ];

  for (const cart of carts) {
    test(
      `calculates item total, 8% tax and total for ${cart.name}`,
      { tag: ['@regression'] },
      async ({ seedCart, checkoutInformationPage, checkoutOverviewPage }) => {
        await seedCart(...cart.products);
        await checkoutInformationPage.goto();
        await checkoutInformationPage.submit(buildCustomer());

        const expected = calculateOrderSummary(cart.products.map((p) => p.price));

        await expect(checkoutOverviewPage.title).toHaveText(PAGE_TITLES.checkoutOverview);
        await expect(checkoutOverviewPage.itemNames).toHaveText(cart.products.map((p) => p.name));
        expect(await checkoutOverviewPage.getSummary()).toEqual(expected);
      },
    );
  }

  test(
    'shows payment and shipping information',
    { tag: ['@regression'] },
    async ({ seedCart, checkoutInformationPage, checkoutOverviewPage }) => {
      await seedCart(PRODUCTS.backpack);
      await checkoutInformationPage.goto();
      await checkoutInformationPage.submit(buildCustomer());

      await expect(checkoutOverviewPage.paymentInfo).toHaveText(/SauceCard #\d+/);
      await expect(checkoutOverviewPage.shippingInfo).toHaveText('Free Pony Express Delivery!');
    },
  );

  test(
    '"Cancel" returns to the inventory without emptying the cart',
    { tag: ['@regression'] },
    async ({ seedCart, checkoutInformationPage, checkoutOverviewPage, inventoryPage }) => {
      await seedCart(PRODUCTS.backpack, PRODUCTS.onesie);
      await checkoutInformationPage.goto();
      await checkoutInformationPage.submit(buildCustomer());

      await checkoutOverviewPage.cancel();

      await inventoryPage.expectToBeOpen();
      await inventoryPage.header.expectCartCount(2);
    },
  );
});
