import { PAGE_TITLES } from '@data/messages';
import { PRODUCTS } from '@data/products';
import { expect, test } from '@fixtures/test';

test.describe('Cart', () => {
  test('empty cart shows no items', { tag: ['@regression'] }, async ({ cartPage }) => {
    await cartPage.goto();

    await expect(cartPage.title).toHaveText(PAGE_TITLES.cart);
    await expect(cartPage.items).toHaveCount(0);
    await cartPage.header.expectCartCount(0);
  });

  test(
    'shows every product added, with quantity and price',
    { tag: ['@smoke'] },
    async ({ seedCart, cartPage }) => {
      const products = [PRODUCTS.backpack, PRODUCTS.bikeLight, PRODUCTS.onesie];
      await seedCart(...products);

      await cartPage.goto();

      await expect(cartPage.itemNames).toHaveText(products.map((p) => p.name));
      await expect(cartPage.itemQuantities).toHaveText(products.map(() => '1'));
      expect(await cartPage.getItemPrices()).toEqual(products.map((p) => p.price));
      await cartPage.header.expectCartCount(products.length);
    },
  );

  test(
    'item can be removed from the cart',
    { tag: ['@regression'] },
    async ({ seedCart, cartPage }) => {
      await seedCart(PRODUCTS.backpack, PRODUCTS.fleeceJacket);
      await cartPage.goto();

      await cartPage.remove(PRODUCTS.backpack);

      await expect(cartPage.itemNames).toHaveText([PRODUCTS.fleeceJacket.name]);
      await cartPage.header.expectCartCount(1);
    },
  );

  test(
    'removing the last item empties the cart',
    { tag: ['@regression'] },
    async ({ seedCart, cartPage }) => {
      await seedCart(PRODUCTS.onesie);
      await cartPage.goto();

      await cartPage.remove(PRODUCTS.onesie);

      await expect(cartPage.items).toHaveCount(0);
      await cartPage.header.expectCartCount(0);
    },
  );

  test(
    '"Continue Shopping" goes back to the inventory keeping the cart',
    { tag: ['@regression'] },
    async ({ seedCart, cartPage, inventoryPage }) => {
      await seedCart(PRODUCTS.bikeLight);
      await cartPage.goto();

      await cartPage.continueShopping();

      await inventoryPage.expectToBeOpen();
      await expect(inventoryPage.removeButton(PRODUCTS.bikeLight)).toBeVisible();
    },
  );

  test(
    'clicking a cart item opens its details page',
    { tag: ['@regression'] },
    async ({ seedCart, cartPage, productDetailsPage }) => {
      await seedCart(PRODUCTS.boltTShirt);
      await cartPage.goto();

      await cartPage.itemNames.first().click();

      await expect(productDetailsPage.name).toHaveText(PRODUCTS.boltTShirt.name);
    },
  );

  test(
    '"Checkout" starts the checkout flow',
    { tag: ['@smoke'] },
    async ({ seedCart, cartPage, checkoutInformationPage }) => {
      await seedCart(PRODUCTS.backpack);
      await cartPage.goto();

      await cartPage.checkout();

      await checkoutInformationPage.expectToBeOpen();
      await expect(checkoutInformationPage.title).toHaveText(PAGE_TITLES.checkoutInfo);
    },
  );
});
