import { ALL_PRODUCTS, PRODUCTS } from '@data/products';
import { expect, test } from '@fixtures/test';

test.describe('Product details', () => {
  for (const product of ALL_PRODUCTS) {
    test(
      `shows consistent data for "${product.name}"`,
      { tag: ['@regression'] },
      async ({ inventoryPage, productDetailsPage }) => {
        await inventoryPage.goto();
        const description = await inventoryPage
          .item(product)
          .getByTestId('inventory-item-desc')
          .textContent();

        await inventoryPage.openProduct(product);

        await productDetailsPage.expectToBeOpen();
        await expect(productDetailsPage.page).toHaveURL(new RegExp(`id=${product.id}$`));
        await expect(productDetailsPage.name).toHaveText(product.name);
        await expect(productDetailsPage.price).toHaveText(`$${product.price}`);
        await expect(productDetailsPage.description).toHaveText(description ?? '');
      },
    );
  }

  test(
    'product can be added and removed from its details page',
    { tag: ['@smoke'] },
    async ({ productDetailsPage }) => {
      await productDetailsPage.gotoProduct(PRODUCTS.boltTShirt);

      await productDetailsPage.addToCartButton.click();
      await expect(productDetailsPage.removeButton).toBeVisible();
      await productDetailsPage.header.expectCartCount(1);

      await productDetailsPage.removeButton.click();
      await expect(productDetailsPage.addToCartButton).toBeVisible();
      await productDetailsPage.header.expectCartCount(0);
    },
  );

  test(
    '"Back to products" returns to the inventory',
    { tag: ['@regression'] },
    async ({ productDetailsPage, inventoryPage }) => {
      await productDetailsPage.gotoProduct(PRODUCTS.onesie);
      await productDetailsPage.backToProducts();

      await inventoryPage.expectToBeOpen();
    },
  );

  test(
    'product added on the details page is reflected in the inventory',
    { tag: ['@regression'] },
    async ({ productDetailsPage, inventoryPage }) => {
      await productDetailsPage.gotoProduct(PRODUCTS.redTShirt);
      await productDetailsPage.addToCartButton.click();
      await productDetailsPage.backToProducts();

      await expect(inventoryPage.removeButton(PRODUCTS.redTShirt)).toBeVisible();
    },
  );

  test(
    'unknown product id shows a not-found state',
    { tag: ['@regression'] },
    async ({ page, productDetailsPage }) => {
      await page.goto(`${productDetailsPage.path}?id=999`);

      await expect(productDetailsPage.name).toHaveText('ITEM NOT FOUND');
    },
  );
});
