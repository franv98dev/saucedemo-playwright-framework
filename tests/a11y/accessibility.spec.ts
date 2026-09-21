import { buildCustomer } from '@data/customer';
import { PRODUCTS } from '@data/products';
import { expect, LOGGED_OUT, test } from '@fixtures/test';

/**
 * Automated WCAG 2.1 A/AA scan with axe-core.
 * Full results are attached to the HTML report of every test.
 */
test.describe('Accessibility', { tag: ['@a11y'] }, () => {
  test.describe('public pages', () => {
    test.use(LOGGED_OUT);

    test('login page has no detectable violations', async ({
      loginPage,
      makeAxeBuilder,
    }, testInfo) => {
      await loginPage.goto();

      const results = await makeAxeBuilder().analyze();
      await testInfo.attach('axe-results', {
        body: JSON.stringify(results, null, 2),
        contentType: 'application/json',
      });

      expect(results.violations.map((v) => v.id)).toEqual([]);
    });
  });

  test.describe('authenticated pages', () => {
    test.beforeEach(async ({ seedCart }) => {
      await seedCart(PRODUCTS.backpack);
    });

    const pages = [
      { name: 'inventory', path: '/inventory.html' },
      { name: 'product details', path: `/inventory-item.html?id=${PRODUCTS.backpack.id}` },
      { name: 'cart', path: '/cart.html' },
      { name: 'checkout information', path: '/checkout-step-one.html' },
    ];

    for (const { name, path } of pages) {
      test(`${name} page has no detectable violations`, async ({
        page,
        makeAxeBuilder,
      }, testInfo) => {
        await page.goto(path);

        const results = await makeAxeBuilder().analyze();
        await testInfo.attach('axe-results', {
          body: JSON.stringify(results, null, 2),
          contentType: 'application/json',
        });

        expect(results.violations.map((v) => v.id)).toEqual([]);
      });
    }

    test('checkout overview page has no detectable violations', async ({
      checkoutInformationPage,
      makeAxeBuilder,
    }, testInfo) => {
      await checkoutInformationPage.goto();
      await checkoutInformationPage.submit(buildCustomer());

      const results = await makeAxeBuilder().analyze();
      await testInfo.attach('axe-results', {
        body: JSON.stringify(results, null, 2),
        contentType: 'application/json',
      });

      expect(results.violations.map((v) => v.id)).toEqual([]);
    });
  });
});
