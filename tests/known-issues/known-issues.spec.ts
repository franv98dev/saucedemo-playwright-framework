import { buildCustomer } from '@data/customer';
import { ALL_PRODUCTS, PRODUCTS } from '@data/products';
import { USERS } from '@data/users';
import { expect, LOGGED_OUT, test } from '@fixtures/test';

/**
 * Defects found during exploratory testing (see docs/BUG_REPORTS.md).
 *
 * Each test asserts the CORRECT behaviour and is marked with `test.fail()`, so:
 *  - the suite stays green while the bug exists (the test is "expected to fail");
 *  - the suite turns red as soon as the bug is fixed, reminding us to promote the test
 *    to a regular regression check.
 */
test.use(LOGGED_OUT);

const bug = (id: string, description: string) => ({
  tag: ['@known-issue'],
  annotation: { type: 'issue', description: `${id}: ${description}` },
});

test.describe('problem_user', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.login(USERS.problem);
  });

  test(
    'product images are unique and load',
    bug('BUG-001', 'All products show the same broken image'),
    async ({ page, inventoryPage }) => {
      test.fail();
      await expect(inventoryPage.items).toHaveCount(ALL_PRODUCTS.length);
      const sources = await page
        .locator('img.inventory_item_img')
        .evaluateAll((images) => (images as HTMLImageElement[]).map((img) => img.src));
      expect(new Set(sources).size).toBe(ALL_PRODUCTS.length);
    },
  );

  test(
    'sorting Z to A reorders the products',
    bug('BUG-002', 'Sorting has no effect'),
    async ({ inventoryPage }) => {
      test.fail();
      await inventoryPage.sortBy('za');
      const names = await inventoryPage.getProductNames();
      expect(names).toEqual([...names].sort((a, b) => b.localeCompare(a)));
    },
  );

  test(
    'every product can be added to the cart',
    bug('BUG-003', 'Half of the "Add to cart" buttons do nothing'),
    async ({ inventoryPage }) => {
      test.fail();
      await inventoryPage.addToCart(...ALL_PRODUCTS);
      await inventoryPage.header.expectCartCount(ALL_PRODUCTS.length);
    },
  );

  test(
    'a product can be removed from the inventory page',
    bug('BUG-004', '"Remove" button does nothing'),
    async ({ inventoryPage }) => {
      test.fail();
      await inventoryPage.addToCart(PRODUCTS.backpack);
      await inventoryPage.removeFromCart(PRODUCTS.backpack);
      await inventoryPage.header.expectCartCount(0);
    },
  );

  test(
    'last name field keeps what the user types',
    bug('BUG-005', 'Typing in Last Name overwrites First Name'),
    async ({ seedCart, checkoutInformationPage }) => {
      test.fail();
      await seedCart(PRODUCTS.backpack);
      await checkoutInformationPage.goto();
      await checkoutInformationPage.fillForm({ firstName: 'Ada', lastName: 'Lovelace' });

      await expect(checkoutInformationPage.firstNameInput).toHaveValue('Ada');
      await expect(checkoutInformationPage.lastNameInput).toHaveValue('Lovelace');
    },
  );
});

test.describe('error_user', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.login(USERS.error);
  });

  test(
    'order can be completed',
    bug('BUG-006', '"Finish" button does not complete the order'),
    async ({ seedCart, checkoutInformationPage, checkoutOverviewPage, checkoutCompletePage }) => {
      test.fail();
      await seedCart(PRODUCTS.backpack);
      await checkoutInformationPage.goto();
      await checkoutInformationPage.submit(buildCustomer());
      await checkoutOverviewPage.finish();

      await checkoutCompletePage.expectToBeOpen();
    },
  );
});

test.describe('visual_user', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.login(USERS.visual);
  });

  test(
    'inventory shows the catalog prices',
    bug('BUG-007', 'Inventory displays wrong, random prices'),
    async ({ inventoryPage }) => {
      test.fail();
      for (const product of ALL_PRODUCTS) {
        await expect(inventoryPage.item(product).getByTestId('inventory-item-price')).toHaveText(
          `$${product.price}`,
          { timeout: 2_000 },
        );
      }
    },
  );
});

test.describe('performance_glitch_user', () => {
  test(
    'login completes in under 2 seconds',
    bug('BUG-008', 'Login takes ~5 seconds'),
    async ({ loginPage, inventoryPage }) => {
      test.fail();
      await loginPage.goto();

      const start = Date.now();
      await loginPage.login(USERS.performanceGlitch);
      await inventoryPage.expectToBeOpen();
      const elapsed = Date.now() - start;

      test.info().annotations.push({ type: 'login-time', description: `${elapsed} ms` });
      expect(elapsed).toBeLessThan(2_000);
    },
  );
});

test.describe('standard_user', () => {
  test(
    '"Reset App State" also resets the product buttons',
    bug('BUG-009', '"Remove" buttons stay visible after reset'),
    async ({ loginPage, inventoryPage }) => {
      test.fail();
      await loginPage.goto();
      await loginPage.login(USERS.standard);
      await inventoryPage.addToCart(PRODUCTS.backpack);

      await inventoryPage.header.resetAppState();

      await expect(inventoryPage.addToCartButton(PRODUCTS.backpack)).toBeVisible({
        timeout: 2_000,
      });
    },
  );

  test(
    'checkout rejects whitespace-only customer data',
    bug('BUG-010', 'Whitespace-only values pass validation'),
    async ({ loginPage, seedCart, checkoutInformationPage }) => {
      test.fail();
      await seedCart(PRODUCTS.backpack);
      await loginPage.goto();
      await loginPage.login(USERS.standard);
      await checkoutInformationPage.goto();

      await checkoutInformationPage.submit({
        firstName: '   ',
        lastName: '   ',
        postalCode: '   ',
      });

      await expect(checkoutInformationPage.errorMessage).toBeVisible({ timeout: 2_000 });
    },
  );

  test(
    'checkout is not available with an empty cart',
    bug('BUG-011', 'Checkout can start with an empty cart'),
    async ({ loginPage, cartPage, checkoutInformationPage }) => {
      test.fail();
      await loginPage.goto();
      await loginPage.login(USERS.standard);
      await cartPage.goto();
      await expect(cartPage.items).toHaveCount(0);

      await cartPage.checkout();

      await expect(checkoutInformationPage.page).not.toHaveURL(/checkout-step-one\.html$/, {
        timeout: 2_000,
      });
    },
  );
});
