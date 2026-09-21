export interface Product {
  id: number;
  name: string;
  price: number;
  /** Slug used by SauceDemo in the add/remove button `data-test` attributes. */
  slug: string;
}

/** Expected catalog. Used as the test oracle for inventory, sorting and pricing checks. */
export const PRODUCTS = {
  backpack: { id: 4, name: 'Sauce Labs Backpack', price: 29.99, slug: 'sauce-labs-backpack' },
  bikeLight: { id: 0, name: 'Sauce Labs Bike Light', price: 9.99, slug: 'sauce-labs-bike-light' },
  boltTShirt: {
    id: 1,
    name: 'Sauce Labs Bolt T-Shirt',
    price: 15.99,
    slug: 'sauce-labs-bolt-t-shirt',
  },
  fleeceJacket: {
    id: 5,
    name: 'Sauce Labs Fleece Jacket',
    price: 49.99,
    slug: 'sauce-labs-fleece-jacket',
  },
  onesie: { id: 2, name: 'Sauce Labs Onesie', price: 7.99, slug: 'sauce-labs-onesie' },
  redTShirt: {
    id: 3,
    name: 'Test.allTheThings() T-Shirt (Red)',
    price: 15.99,
    slug: 'test.allthethings()-t-shirt-(red)',
  },
} as const satisfies Record<string, Product>;

export const ALL_PRODUCTS: readonly Product[] = Object.values(PRODUCTS);
