import { faker } from '@faker-js/faker';

export interface CustomerInfo {
  firstName: string;
  lastName: string;
  postalCode: string;
}

/** Builds random but realistic checkout data, so tests don't depend on fixed values. */
export function buildCustomer(overrides: Partial<CustomerInfo> = {}): CustomerInfo {
  return {
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    postalCode: faker.location.zipCode(),
    ...overrides,
  };
}
