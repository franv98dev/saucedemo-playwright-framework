import { buildCustomer } from '@data/customer';
import { CHECKOUT_ERRORS } from '@data/messages';
import { PRODUCTS } from '@data/products';
import { expect, test } from '@fixtures/test';

test.describe('Checkout: customer information', () => {
  test.beforeEach(async ({ seedCart, checkoutInformationPage }) => {
    await seedCart(PRODUCTS.backpack);
    await checkoutInformationPage.goto();
  });

  test(
    'valid information moves on to the overview',
    { tag: ['@smoke'] },
    async ({ checkoutInformationPage, checkoutOverviewPage }) => {
      await checkoutInformationPage.submit(buildCustomer());

      await checkoutOverviewPage.expectToBeOpen();
    },
  );

  const missingFieldCases = [
    {
      missing: 'first name',
      data: buildCustomer({ firstName: '' }),
      error: CHECKOUT_ERRORS.firstNameRequired,
    },
    {
      missing: 'last name',
      data: buildCustomer({ lastName: '' }),
      error: CHECKOUT_ERRORS.lastNameRequired,
    },
    {
      missing: 'postal code',
      data: buildCustomer({ postalCode: '' }),
      error: CHECKOUT_ERRORS.postalCodeRequired,
    },
    {
      missing: 'all fields',
      data: { firstName: '', lastName: '', postalCode: '' },
      error: CHECKOUT_ERRORS.firstNameRequired,
    },
  ];

  for (const { missing, data, error } of missingFieldCases) {
    test(
      `requires ${missing}`,
      { tag: ['@regression'] },
      async ({ page, checkoutInformationPage }) => {
        await checkoutInformationPage.submit(data);

        await checkoutInformationPage.expectError(error);
        await expect(page).toHaveURL(/checkout-step-one\.html$/);
      },
    );
  }

  test(
    'validates fields in order: first name, last name, postal code',
    { tag: ['@regression'] },
    async ({ checkoutInformationPage }) => {
      await checkoutInformationPage.submit({});
      await checkoutInformationPage.expectError(CHECKOUT_ERRORS.firstNameRequired);

      await checkoutInformationPage.submit({ firstName: 'Ada' });
      await checkoutInformationPage.expectError(CHECKOUT_ERRORS.lastNameRequired);

      await checkoutInformationPage.submit({ lastName: 'Lovelace' });
      await checkoutInformationPage.expectError(CHECKOUT_ERRORS.postalCodeRequired);
    },
  );

  test(
    'accepts names with accents and special characters',
    { tag: ['@regression'] },
    async ({ checkoutInformationPage, checkoutOverviewPage }) => {
      await checkoutInformationPage.submit({
        firstName: 'María José',
        lastName: "O'Connor-Núñez",
        postalCode: 'A4400',
      });

      await checkoutOverviewPage.expectToBeOpen();
    },
  );

  test(
    '"Cancel" returns to the cart',
    { tag: ['@regression'] },
    async ({ checkoutInformationPage, cartPage }) => {
      await checkoutInformationPage.cancel();

      await cartPage.expectToBeOpen();
      await expect(cartPage.itemNames).toHaveText([PRODUCTS.backpack.name]);
    },
  );
});
