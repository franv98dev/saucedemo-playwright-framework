import { expect, type Locator, type Page } from '@playwright/test';

import { type Product } from '../data/products';
import { BasePage } from './BasePage';

export class ProductDetailsPage extends BasePage {
  readonly path = '/inventory-item.html';

  readonly name: Locator;
  readonly description: Locator;
  readonly price: Locator;
  readonly image: Locator;
  readonly addToCartButton: Locator;
  readonly removeButton: Locator;
  readonly backButton: Locator;

  constructor(page: Page) {
    super(page);
    this.name = page.getByTestId('inventory-item-name');
    this.description = page.getByTestId('inventory-item-desc');
    this.price = page.getByTestId('inventory-item-price');
    this.image = page.locator('.inventory_details_img');
    this.addToCartButton = page.getByTestId('add-to-cart');
    this.removeButton = page.getByTestId('remove');
    this.backButton = page.getByTestId('back-to-products');
  }

  async gotoProduct(product: Product): Promise<void> {
    await this.page.goto(`${this.path}?id=${product.id}`);
  }

  /** The details page is a client-side route: wait for its content, not just the URL. */
  async expectToBeOpen(): Promise<void> {
    await expect(this.page).toHaveURL(/\/inventory-item\.html\?id=\d+$/);
    await expect(this.backButton).toBeVisible();
  }

  async backToProducts(): Promise<void> {
    await this.backButton.click();
  }
}
