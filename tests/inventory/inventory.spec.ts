import { ALL_PRODUCTS, PRODUCTS } from '@data/products';
import { expect, test } from '@fixtures/test';
import { type SortOption } from '@pages/InventoryPage';

test.describe('Inventory', () => {
  test.beforeEach(async ({ inventoryPage }) => {
    await inventoryPage.goto();
  });

  test(
    'lists the full catalog with the expected prices',
    { tag: ['@smoke'] },
    async ({ inventoryPage }) => {
      await expect(inventoryPage.items).toHaveCount(ALL_PRODUCTS.length);

      for (const product of ALL_PRODUCTS) {
        const card = inventoryPage.item(product);
        await expect(card.getByTestId('inventory-item-price')).toHaveText(`$${product.price}`);
      }
    },
  );

  test(
    'every product has a description and an image with alt text',
    { tag: ['@regression'] },
    async ({ inventoryPage }) => {
      for (const product of ALL_PRODUCTS) {
        const card = inventoryPage.item(product);
        await expect(card.getByTestId('inventory-item-desc')).not.toBeEmpty();
        await expect(card.getByRole('img', { name: product.name })).toBeVisible();
      }
    },
  );

  test(
    'product images load successfully',
    { tag: ['@regression'] },
    async ({ page, inventoryPage }) => {
      await expect(inventoryPage.items).toHaveCount(ALL_PRODUCTS.length);

      // naturalWidth is 0 when the browser could not decode the image (broken link).
      // Images load asynchronously, so poll until every one has settled.
      await expect
        .poll(() =>
          page
            .locator('img.inventory_item_img')
            .evaluateAll((images) =>
              (images as HTMLImageElement[])
                .filter((img) => !img.complete || img.naturalWidth === 0)
                .map((img) => img.alt),
            ),
        )
        .toEqual([]);

      // Also guard against the "same placeholder for every product" defect.
      const sources = await page
        .locator('img.inventory_item_img')
        .evaluateAll((images) => (images as HTMLImageElement[]).map((img) => img.src));
      expect(new Set(sources).size).toBe(ALL_PRODUCTS.length);
    },
  );

  test.describe('sorting', () => {
    const byName = (a: string, b: string) => a.localeCompare(b);

    const nameSortCases: { option: SortOption; label: string; descending: boolean }[] = [
      { option: 'az', label: 'Name (A to Z)', descending: false },
      { option: 'za', label: 'Name (Z to A)', descending: true },
    ];

    const priceSortCases: { option: SortOption; label: string; descending: boolean }[] = [
      { option: 'lohi', label: 'Price (low to high)', descending: false },
      { option: 'hilo', label: 'Price (high to low)', descending: true },
    ];

    test('defaults to Name (A to Z)', { tag: ['@regression'] }, async ({ inventoryPage }) => {
      await expect(inventoryPage.activeSortOption).toHaveText('Name (A to Z)');
      const names = await inventoryPage.getProductNames();
      expect(names).toEqual([...names].sort(byName));
    });

    for (const { option, label, descending } of nameSortCases) {
      test(`sorts products by ${label}`, { tag: ['@regression'] }, async ({ inventoryPage }) => {
        await inventoryPage.sortBy(option);
        await expect(inventoryPage.activeSortOption).toHaveText(label);

        const names = await inventoryPage.getProductNames();
        const ascending = [...names].sort(byName);
        expect(names).toEqual(descending ? ascending.reverse() : ascending);
      });
    }

    for (const { option, label, descending } of priceSortCases) {
      test(`sorts products by ${label}`, { tag: ['@regression'] }, async ({ inventoryPage }) => {
        await inventoryPage.sortBy(option);
        await expect(inventoryPage.activeSortOption).toHaveText(label);

        const prices = await inventoryPage.getProductPrices();
        const ascending = [...prices].sort((x, y) => x - y);
        expect(prices).toEqual(descending ? ascending.reverse() : ascending);
      });
    }

    test(
      'keeps the cart intact when sorting',
      { tag: ['@regression'] },
      async ({ inventoryPage }) => {
        await inventoryPage.addToCart(PRODUCTS.onesie);
        await inventoryPage.sortBy('hilo');

        await inventoryPage.header.expectCartCount(1);
        await expect(inventoryPage.removeButton(PRODUCTS.onesie)).toBeVisible();
      },
    );
  });

  test.describe('add to cart', () => {
    test(
      'adding a product toggles its button and updates the badge',
      { tag: ['@smoke'] },
      async ({ inventoryPage }) => {
        await inventoryPage.header.expectCartCount(0);

        await inventoryPage.addToCart(PRODUCTS.backpack);

        await expect(inventoryPage.removeButton(PRODUCTS.backpack)).toBeVisible();
        await expect(inventoryPage.addToCartButton(PRODUCTS.backpack)).toBeHidden();
        await inventoryPage.header.expectCartCount(1);
      },
    );

    test(
      'badge counts every product added',
      { tag: ['@regression'] },
      async ({ inventoryPage }) => {
        await inventoryPage.addToCart(...ALL_PRODUCTS);

        await inventoryPage.header.expectCartCount(ALL_PRODUCTS.length);
      },
    );

    test(
      'removing a product restores its button and updates the badge',
      { tag: ['@regression'] },
      async ({ inventoryPage }) => {
        await inventoryPage.addToCart(PRODUCTS.backpack, PRODUCTS.bikeLight);
        await inventoryPage.removeFromCart(PRODUCTS.backpack);

        await expect(inventoryPage.addToCartButton(PRODUCTS.backpack)).toBeVisible();
        await inventoryPage.header.expectCartCount(1);
      },
    );

    test(
      'cart selection survives a page reload',
      { tag: ['@regression'] },
      async ({ page, inventoryPage }) => {
        await inventoryPage.addToCart(PRODUCTS.fleeceJacket);
        await page.reload();

        await inventoryPage.header.expectCartCount(1);
        await expect(inventoryPage.removeButton(PRODUCTS.fleeceJacket)).toBeVisible();
      },
    );
  });
});
